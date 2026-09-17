#!/usr/bin/env python3
"""
QMIX Content Pruning - Network orchestrator

Iterates the 4 hostings (qmix, anderson, vps1, hostverge) and orchestrates
content pruning across the 129-portal network.

Modes:
  audit      - Read-only scan. Produces CSV per portal of candidates.
  execute    - Apply pruning lifecycle (publish->draft, draft->trash, trash->delete).
  rollback   - Revert posts pruned on a specific date.
  status     - Report stage counts per portal.

Usage:
  python prune_low_value_posts.py --mode=audit --output=audit-YYYY-MM-DD.csv
  python prune_low_value_posts.py --mode=execute --input=audit-YYYY-MM-DD.csv --pace=5
  python prune_low_value_posts.py --mode=rollback --pruning-run=2026-05-27
  python prune_low_value_posts.py --mode=status

Configuration:
  - Hosting layouts hardcoded below (mirrors reality of QMIX network)
  - Excluded sites read from feedback_sites_clientes_rede.md
  - Logs to D:/SISTEMAS/MinhasHospedagens/pruning-logs/
  - Audits to D:/SISTEMAS/MinhasHospedagens/pruning-audits/
"""

import argparse
import csv
import datetime as dt
import json
import os
import random
import subprocess
import sys
import time
from pathlib import Path

# ===============================================================
# Config
# ===============================================================

BASE_DIR = Path(r"D:\SISTEMAS\MinhasHospedagens")
SCRIPTS_DIR = BASE_DIR / "scripts"
LOGS_DIR = BASE_DIR / "pruning-logs"
AUDITS_DIR = BASE_DIR / "pruning-audits"

# Hosting -> SSH alias and WP base path. The audit/execute PHP files get scp'd
# to /tmp/ on each host then run via `wp eval-file --path=<WP_PATH>`.
HOSTINGS = {
    "qmix": {
        "ssh": "hostinger-qmix",
        "base": "/home/u463007860/domains",
        "wp_subpath": "public_html",
        "needs_jump": False,
    },
    "anderson": {
        "ssh": "hostinger-anderson-gna",
        "base": "/home/u400588174/domains",
        "wp_subpath": "public_html",
        "needs_jump": False,
    },
    "vps1": {
        "ssh": "hostinger-vps1",
        "base": "/home/u651115354/domains",
        "wp_subpath": "public_html",
        "needs_jump": False,
    },
    "hostverge": {
        "ssh": "hostverge",
        "base": "/home/sites/18a/7/7672b9147f/public_html",
        "wp_subpath": "",
        "needs_jump": False,
        "wp_extra_flags": "--allow-root",
    },
}

# Excluded domains: clients + decommissioned (per memory feedback_sites_clientes_rede.md)
EXCLUDED_DOMAINS = {
    # Clientes (23)
    "blog.advdobrasil.com.br", "blog.aplusplatform.com", "blog.camilafarias.com.br",
    "blog.cirurgiadojoelhogoiania.com", "blog.clinicasrecuperacaosaopaulo.com",
    "blog.coegoiania.com.br", "blog.drbrunoair.com.br", "blog.drhenriquebufaical.com.br",
    "blog.drthiagotredicci.com.br", "blog.drtiagobernardes.com.br",
    "blog.nutricionista.digital", "blog.ombrogoiania.com.br", "blog.qmix.com.br",
    "cirurgiacoracao.com.br", "cirurgiadacatarata.com.br", "cirurgiadecancer.com.br",
    "cirurgiadecolunagoiania.com.br", "cirurgiadojoelhogoiania.com",
    "clinicasrecuperacaosaopaulo.com", "drbrunoair.com.br", "drtiagobernardes.com.br",
    "institutoortopedico.com.br", "medicodasmaos.com.br",
    # Removidos da rede
    "setorenergetico.com.br", "arcondicionadotop.com", "geladeirastop.com",
    # Hostverge domain mapping irregularities (folder name != domain)
    # All hostverge medicos/clinicas fall under "client" exclusion via parent domain match below.
}

# Allowlist: SÓ processar domínios da rede de publicação de backlinks (não clientes, não marketing-qmix).
ALLOWLIST_FILE = BASE_DIR / "rede-publicacao-allowlist.txt"
def _load_allowlist():
    allow = set()
    try:
        for line in ALLOWLIST_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("portal:"):
                continue
            allow.add(line)
    except FileNotFoundError:
        pass
    return allow
ALLOWLIST = _load_allowlist()

# Default thresholds (overridable via CLI)
DEFAULT_MIN_AGE_DAYS = 120
DEFAULT_MAX_VIEWS = 5
DEFAULT_PACE = 5  # posts/site/day

# ===============================================================
# SSH helpers
# ===============================================================

def run_ssh(host_cfg, remote_cmd, timeout=300):
    """Run a remote command, optionally through a jump host."""
    if host_cfg["needs_jump"]:
        # ssh opengravity "<jump_cmd> '<remote_cmd>'"
        full = f"{host_cfg['jump_cmd']} \"{remote_cmd}\""
        cmd = ["ssh", host_cfg["ssh"], full]
    else:
        cmd = ["ssh", host_cfg["ssh"], remote_cmd]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True,
                                encoding="utf-8", errors="replace", timeout=timeout)
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 124, "", "ssh timeout"
    except Exception as e:
        return 1, "", "ssh error: " + str(e)


def scp_to_host(host_cfg, local_path, remote_path):
    """Copy a local file to remote /tmp/, hopping through jump if needed."""
    if host_cfg["needs_jump"]:
        # 1. SCP to opengravity
        intermediate = f"/tmp/qmix-prune-{int(time.time())}-{Path(local_path).name}"
        subprocess.run(["scp", str(local_path), f"{host_cfg['ssh']}:{intermediate}"],
                       capture_output=True, text=True, check=True, timeout=60)
        # 2. SCP from opengravity to hostverge via key
        relay = f"scp -i /root/.ssh/id_hostverge {intermediate} qmix.com.br@ssh.us.stackcp.com:{remote_path}"
        subprocess.run(["ssh", host_cfg["ssh"], relay],
                       capture_output=True, text=True, check=True, timeout=120)
        subprocess.run(["ssh", host_cfg["ssh"], f"rm -f {intermediate}"],
                       capture_output=True, text=True, timeout=30)
    else:
        subprocess.run(["scp", str(local_path), f"{host_cfg['ssh']}:{remote_path}"],
                       capture_output=True, text=True, check=True, timeout=60)


def list_sites(hosting_name):
    """Return [(site_dir, full_wp_path), ...] for sites with wp-config.php."""
    h = HOSTINGS[hosting_name]
    if hosting_name == "hostverge":
        cmd = f"cd {h['base']} && ls -d */ 2>/dev/null"
    else:
        cmd = f"cd {h['base']} && ls -d */"
    rc, out, err = run_ssh(h, cmd, timeout=30)
    sites = []
    for line in out.splitlines():
        line = line.strip().rstrip("/")
        if not line or line in ("backup-works", "_backups_notebookx", "backups-skill"):
            continue
        if hosting_name == "hostverge":
            wp_path = f"{h['base']}/{line}"
        else:
            wp_path = f"{h['base']}/{line}/{h['wp_subpath']}"
        sites.append((line, wp_path))
    return sites


def wp_eval_file(hosting_name, wp_path, php_remote_path, env_vars=None, timeout=120):
    """Run `wp eval-file` on a remote site. Returns (rc, stdout, stderr)."""
    h = HOSTINGS[hosting_name]
    extra = h.get("wp_extra_flags", "")
    env_prefix = ""
    if env_vars:
        env_prefix = " ".join(f"{k}={v}" for k, v in env_vars.items()) + " "
    cmd = f"{env_prefix}wp --path={wp_path} {extra} eval-file {php_remote_path}".strip()
    return run_ssh(h, cmd, timeout=timeout)


# ===============================================================
# Mode: AUDIT
# ===============================================================

def cmd_audit(args):
    """Iterate all sites, run prune_audit.php, write CSV."""
    audit_php_local = SCRIPTS_DIR / "prune_audit.php"
    if not audit_php_local.exists():
        print(f"ERROR: {audit_php_local} not found", file=sys.stderr)
        return 1

    timestamp = dt.datetime.now().strftime("%Y-%m-%d-%H%M")
    audit_csv = AUDITS_DIR / (args.output or f"audit-{timestamp}.csv")
    log_file = LOGS_DIR / f"audit-{timestamp}.log"
    AUDITS_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    all_candidates = []
    log = open(log_file, "w", encoding="utf-8")

    env_vars = {
        "QMIX_PRUNE_MIN_AGE": str(args.min_age),
        "QMIX_PRUNE_MAX_VIEWS": str(args.max_views),
    }

    for hosting_name, h in HOSTINGS.items():
        if args.hosting and hosting_name != args.hosting:
            continue

        print(f"\n=== {hosting_name} ===", flush=True)
        log.write(f"\n=== {hosting_name} ===\n")

        # Upload PHP script once per hosting
        remote_php = "/tmp/prune_audit.php"
        try:
            scp_to_host(h, audit_php_local, remote_php)
        except Exception as e:
            msg = f"SCP failed to {hosting_name}: {e}"
            print(msg, flush=True); log.write(msg + "\n")
            continue

        sites = list_sites(hosting_name)
        for site_dir, wp_path in sites:
            domain = site_dir
            if ALLOWLIST and domain not in ALLOWLIST:
                # fora da lista de backlinks da rede (marketing-qmix, outros) -> nunca tocar
                continue
            if domain in EXCLUDED_DOMAINS:
                print(f"  SKIP {domain} (excluded)", flush=True)
                log.write(f"SKIP {domain} (excluded)\n")
                continue

            # Confirm wp-config exists
            rc, _wpcfg, _ = run_ssh(h, f"test -f {wp_path}/wp-config.php && echo OK", timeout=45)
            if "OK" not in _wpcfg:
                continue

            rc, out, err = wp_eval_file(hosting_name, wp_path, remote_php, env_vars=env_vars)
            if rc != 0:
                msg = f"  FAIL {domain}: rc={rc} err={err[:200]}"
                print(msg, flush=True); log.write(msg + "\n")
                continue

            if not out or not out.strip():
                print(f"  EMPTY {domain} (no output)", flush=True)
                log.write(f"EMPTY {domain}\n")
                continue
            try:
                data = json.loads(out.strip().splitlines()[-1])
            except Exception as e:
                msg = f"  PARSE_FAIL {domain}: {e} :: {(out or '')[:200]}"
                print(msg, flush=True); log.write(msg + "\n")
                continue

            print(f"  {domain}: {data['candidates_count']} candidates of {data['total_published']} published",
                  flush=True)
            log.write(f"{domain}: {data['candidates_count']}/{data['total_published']}\n")

            for c in data["candidates"]:
                all_candidates.append({
                    "hosting": hosting_name,
                    "site": domain,
                    "id": c["id"],
                    "title": c["title"],
                    "post_date": c["post_date"],
                    "age_days": c["age_days"],
                    "views": c["views"],
                    "content_size": c["content_size"],
                    "comments": c["comments"],
                    "permalink": c["permalink"],
                    "decision": "prune",
                    "override": "",
                })

    # Write CSV
    if all_candidates:
        fieldnames = ["hosting", "site", "id", "title", "post_date", "age_days",
                      "views", "content_size", "comments", "permalink",
                      "decision", "override"]
        with open(audit_csv, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_candidates)
        print(f"\nWrote {len(all_candidates)} candidates to {audit_csv}", flush=True)
        log.write(f"\nTotal: {len(all_candidates)} candidates -> {audit_csv}\n")
    else:
        print("\nNo candidates found.", flush=True)

    log.close()
    return 0


# ===============================================================
# Mode: EXECUTE
# ===============================================================

def cmd_execute(args):
    """Apply the lifecycle. Reads CSV, respects override col, paces per site."""
    if not args.input:
        print("ERROR: --input=<csv> required", file=sys.stderr)
        return 1
    csv_path = Path(args.input)
    if not csv_path.is_absolute():
        csv_path = AUDITS_DIR / csv_path
    if not csv_path.exists():
        print(f"ERROR: {csv_path} not found", file=sys.stderr)
        return 1

    execute_php_local = SCRIPTS_DIR / "prune_execute.php"
    if not execute_php_local.exists():
        print(f"ERROR: {execute_php_local} not found", file=sys.stderr)
        return 1

    timestamp = dt.datetime.now().strftime("%Y-%m-%d-%H%M")
    log_file = LOGS_DIR / f"execute-{timestamp}.log"
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log = open(log_file, "w", encoding="utf-8")

    # Group by (hosting, site), respect override col
    by_site = {}
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            override = (row.get("override") or "").strip().lower()
            if override == "keep":
                continue
            key = (row["hosting"], row["site"])
            by_site.setdefault(key, []).append(int(row["id"]))

    # Per-site pace cap
    pace = args.pace
    for (hosting_name, site), ids in by_site.items():
        if len(ids) > pace:
            print(f"  PACE {site}: capping {len(ids)} -> {pace}")
            by_site[(hosting_name, site)] = ids[:pace]

    # Random jitter ordering
    items = list(by_site.items())
    random.shuffle(items)

    # Upload prune_execute.php once per hosting
    uploaded_hostings = set()

    dry_label = " [DRY-RUN]" if args.dry_run else ""
    print(f"\n=== EXECUTE{dry_label}: {sum(len(v) for v in by_site.values())} posts across {len(by_site)} sites ===\n",
          flush=True)
    log.write(f"=== EXECUTE{dry_label} {timestamp} ===\n")

    for (hosting_name, site), ids in items:
        h = HOSTINGS[hosting_name]
        if hosting_name not in uploaded_hostings:
            try:
                scp_to_host(h, execute_php_local, "/tmp/prune_execute.php")
                uploaded_hostings.add(hosting_name)
            except Exception as e:
                msg = f"SCP failed {hosting_name}: {e}"
                print(msg, flush=True); log.write(msg + "\n")
                continue

        # Find wp_path
        wp_path = f"{h['base']}/{site}/{h['wp_subpath']}" if hosting_name != "hostverge" else f"{h['base']}/{site}"

        # Write input JSON locally and ship it
        input_payload = {
            "ids_to_draft": ids,
            "dry_run": bool(args.dry_run),
        }
        input_local = LOGS_DIR / f"input-{site}-{timestamp}.json"
        input_local.write_text(json.dumps(input_payload), encoding="utf-8")
        try:
            scp_to_host(h, input_local, "/tmp/prune_input.json")
        except Exception as e:
            msg = f"  SCP input failed {site}: {e}"
            print(msg, flush=True); log.write(msg + "\n")
            continue

        env_vars = {
            "QMIX_PRUNE_DRAFT_GRACE": str(args.draft_grace),
            "QMIX_PRUNE_TRASH_GRACE": str(args.trash_grace),
        }
        rc, out, err = wp_eval_file(hosting_name, wp_path, "/tmp/prune_execute.php",
                                     env_vars=env_vars, timeout=180)
        if rc != 0:
            msg = f"  FAIL {site}: rc={rc} err={err[:300]}"
            print(msg, flush=True); log.write(msg + "\n")
            continue

        try:
            report = json.loads(out.strip().splitlines()[-1])
        except Exception as e:
            msg = f"  PARSE_FAIL {site}: {e} :: {out[:300]}"
            print(msg, flush=True); log.write(msg + "\n")
            continue

        d = len(report.get("phase_1_drafted", []))
        t = len(report.get("phase_2_trashed", []))
        x = len(report.get("phase_3_deleted", []))
        errs = len(report.get("errors", []))
        line = f"  {site}: drafted={d} trashed={t} deleted={x} errors={errs}"
        print(line, flush=True); log.write(line + "\n")

        # Random jitter between sites (4-12h would be production; use 5-30s for now)
        # In production cron, this should be split into 1-per-day jobs anyway
        if args.production_jitter:
            sleep_s = random.randint(4 * 3600, 12 * 3600)
            print(f"  ...sleeping {sleep_s}s before next site", flush=True)
            time.sleep(sleep_s)

    log.close()
    return 0


# ===============================================================
# Mode: ROLLBACK
# ===============================================================

def cmd_rollback(args):
    """Revert all posts pruned on a specific date."""
    if not args.pruning_run:
        print("ERROR: --pruning-run=YYYY-MM-DD required", file=sys.stderr)
        return 1
    target_date = args.pruning_run

    # PHP snippet to roll back (inline, simple enough)
    rollback_php = f'''<?php
if (!defined("ABSPATH")) exit;
global $wpdb;
$start = strtotime("{target_date} 00:00:00");
$end   = strtotime("{target_date} 23:59:59");
$ids = $wpdb->get_col($wpdb->prepare(
    "SELECT post_id FROM {{$wpdb->postmeta}}
     WHERE meta_key = '_qmix_pruned_at' AND meta_value+0 BETWEEN %d AND %d",
    $start, $end
));
$restored = array();
foreach ($ids as $id) {{
    $id = (int) $id;
    $orig_status = get_post_meta($id, "_qmix_pruned_orig_status", true) ?: "publish";
    $current = get_post_status($id);
    if ($current === "publish") continue;
    $current_name = $wpdb->get_var($wpdb->prepare("SELECT post_name FROM {{$wpdb->posts}} WHERE ID = %d", $id));
    $clean_slug = preg_replace("/__trashed$/", "", $current_name);
    $wpdb->update($wpdb->posts,
        array("post_status" => $orig_status, "post_name" => $clean_slug),
        array("ID" => $id),
        array("%s", "%s"), array("%d"));
    delete_post_meta($id, "_qmix_pruned_at");
    delete_post_meta($id, "_qmix_pruned_stage");
    delete_post_meta($id, "_qmix_pruned_reason");
    delete_post_meta($id, "_qmix_pruned_backup_content");
    delete_post_meta($id, "_qmix_pruned_backup_excerpt");
    delete_post_meta($id, "_qmix_pruned_orig_status");
    delete_post_meta($id, "<<REMOVIDO>>");
    delete_post_meta($id, "_wp_trash_meta_status");
    delete_post_meta($id, "_wp_trash_meta_time");
    delete_post_meta($id, "_wp_desired_post_slug");
    clean_post_cache($id);
    $restored[] = $id;
}}
do_action("litespeed_purge_all");
echo json_encode(array("restored" => $restored));
'''
    rollback_local = SCRIPTS_DIR / "_rollback_tmp.php"
    rollback_local.write_text(rollback_php, encoding="utf-8")

    total = 0
    for hosting_name, h in HOSTINGS.items():
        scp_to_host(h, rollback_local, "/tmp/prune_rollback.php")
        for site_dir, wp_path in list_sites(hosting_name):
            rc, _wpcfg, _ = run_ssh(h, f"test -f {wp_path}/wp-config.php && echo OK", timeout=45)
            if "OK" not in _wpcfg:
                continue
            rc, out, err = wp_eval_file(hosting_name, wp_path, "/tmp/prune_rollback.php", timeout=120)
            if rc != 0: continue
            try:
                data = json.loads(out.strip().splitlines()[-1])
                n = len(data.get("restored", []))
                if n > 0:
                    print(f"  {site_dir}: restored {n} posts")
                    total += n
            except Exception:
                pass

    rollback_local.unlink(missing_ok=True)
    print(f"\nTotal restored: {total}")
    return 0


# ===============================================================
# Mode: STATUS
# ===============================================================

def cmd_status(args):
    """Show how many posts each portal has in each pruning stage."""
    status_php = '''<?php
if (!defined("ABSPATH")) exit;
global $wpdb;
$drafted = (int)$wpdb->get_var("SELECT COUNT(*) FROM $wpdb->postmeta WHERE meta_key='_qmix_pruned_stage' AND meta_value='drafted'");
$trashed = (int)$wpdb->get_var("SELECT COUNT(*) FROM $wpdb->postmeta WHERE meta_key='_qmix_pruned_stage' AND meta_value='trashed'");
echo json_encode(array("drafted"=>$drafted, "trashed"=>$trashed));
'''
    status_local = SCRIPTS_DIR / "_status_tmp.php"
    status_local.write_text(status_php, encoding="utf-8")

    print(f"{'Site':<50} {'Drafted':>10} {'Trashed':>10}")
    print("-" * 72)
    grand_d = grand_t = 0
    for hosting_name, h in HOSTINGS.items():
        scp_to_host(h, status_local, "/tmp/prune_status.php")
        for site_dir, wp_path in list_sites(hosting_name):
            rc, _wpcfg, _ = run_ssh(h, f"test -f {wp_path}/wp-config.php && echo OK", timeout=10)
            if "OK" not in _wpcfg: continue
            rc, out, err = wp_eval_file(hosting_name, wp_path, "/tmp/prune_status.php", timeout=60)
            if rc != 0: continue
            try:
                data = json.loads(out.strip().splitlines()[-1])
                d = data["drafted"]; t = data["trashed"]
                if d > 0 or t > 0:
                    print(f"{site_dir:<50} {d:>10} {t:>10}")
                grand_d += d; grand_t += t
            except Exception:
                pass

    print("-" * 72)
    print(f"{'TOTAL':<50} {grand_d:>10} {grand_t:>10}")
    status_local.unlink(missing_ok=True)
    return 0


# ===============================================================
# Main
# ===============================================================

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--mode", required=True, choices=["audit", "execute", "rollback", "status"])
    p.add_argument("--output", help="audit CSV filename (mode=audit)")
    p.add_argument("--input", help="audit CSV to execute (mode=execute)")
    p.add_argument("--pruning-run", help="YYYY-MM-DD (mode=rollback)")
    p.add_argument("--hosting", help="limit to one hosting: qmix|anderson|vps1|hostverge")
    p.add_argument("--min-age", type=int, default=DEFAULT_MIN_AGE_DAYS)
    p.add_argument("--max-views", type=int, default=DEFAULT_MAX_VIEWS)
    p.add_argument("--pace", type=int, default=DEFAULT_PACE,
                   help="max posts drafted per site per execution (default 5)")
    p.add_argument("--draft-grace", type=int, default=30)
    p.add_argument("--trash-grace", type=int, default=30)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--production-jitter", action="store_true",
                   help="sleep 4-12h between sites (real anti-fingerprint pacing)")
    args = p.parse_args()

    if args.mode == "audit":
        return cmd_audit(args)
    elif args.mode == "execute":
        return cmd_execute(args)
    elif args.mode == "rollback":
        return cmd_rollback(args)
    elif args.mode == "status":
        return cmd_status(args)


if __name__ == "__main__":
    sys.exit(main())

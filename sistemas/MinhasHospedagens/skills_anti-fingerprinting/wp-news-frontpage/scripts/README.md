# Scripts

Helper Python scripts that automate the roll + deploy of a portal. Run from the skill root:

```bash
cd wp-news-frontpage/
```

## roll.py

Generates a fingerprint roll for a new portal that diverges from neighbors.

**Inputs:**
- Domain of the portal being created.
- Optional: list of neighbor domains, VPS name, niche, theme.
- Optional: minimum critical-vars divergence (default 18 of 24+).

**Output formats:**
- `--output=header` (default): PHP comment block ready to paste at top of templates.
- `--output=json`: full entry as JSON (use with `--append` to record).

**Examples:**

```bash
# Generate roll, print header, do not record
python scripts/roll.py --portal=novoportal.com.br --vps=h-anderson --theme=GeneratePress

# Generate AND record
python scripts/roll.py --portal=novoportal.com.br --vps=h-anderson \
    --theme=Blocksy --niche=saude --append

# Force a specific archetype
python scripts/roll.py --portal=novoportal.com.br --archetype=C --append

# Stricter divergence (20 of 24 criticals must differ)
python scripts/roll.py --portal=novoportal.com.br --critical-divergence=20
```

## install_portal.py

Applies a generated portal package to a live WP site over SSH+wp-cli.

**Pre-conditions:**
- `data/fingerprint-rolls.json` already has an entry for the portal (run roll.py first).
- `generated/<portal>/` exists with all template files (the LLM produces these via the skill).
- SSH key auth set up to the target server.
- wp-cli installed on the target.

**What it does:**
1. Installs parent theme via `wp theme install` (if not present).
2. Creates child theme directory and skeleton.
3. Uploads all files from `generated/<portal>/` to `wp-content/themes/portal-<slug>/`.
4. Activates the child theme.
5. Applies WP options: permalink, date format, posts per page.
6. Reports next manual steps (logo, menu construction, Customizer review).

**Examples:**

```bash
# Dry-run to preview commands
python scripts/install_portal.py --portal=novoportal.com.br \
    --ssh-host=u123@hostinger.example --ssh-port=65002 \
    --wp-path=/home/u123/domains/novoportal.com.br/public_html --dry-run

# Actually deploy
python scripts/install_portal.py --portal=novoportal.com.br \
    --ssh-host=renato-novo --ssh-port=22222 \
    --wp-path=/home/segdigital/htdocs/seguidores.digital --allow-root
```

The script uses single-file `cat | ssh` streams for upload (works through firewalls that block SCP/SFTP).

## append_roll.py

Append a manually-built roll JSON to the registry. Use when you wrote a `front-page.php` by hand and want to record its roll.

```bash
cat my-roll.json | python scripts/append_roll.py
```

The JSON must follow the schema in `data/fingerprint-rolls.json`.

## Why these scripts exist

The skill itself remains the LLM-facing layer (reads SKILL.md and references, produces PHP/CSS code). The scripts are the operator-facing layer:

- **`roll.py`**: removes randomness from the LLM. The LLM gets fixed values, never re-rolls.
- **`install_portal.py`**: removes manual SSH/scp/wp-cli steps. One command, idempotent, dry-run-able.
- **`append_roll.py`**: keeps the registry consistent when rolls are built outside the script.

This separation makes the network grow faster: roll + skill-generate + install_portal = a new diversified portal in 5 to 10 minutes instead of 1 to 2 hours of manual work.

## Roadmap

Future scripts that would complement these:

- `audit_portal.py`: scan a deployed portal, extract its DOM signatures (class names, palette hex, font names), and verify they match the recorded roll. Catches drift over time.
- `network_similarity.py`: compute pairwise DOM similarity across N portals (SimHash on rendered HTML). Independent of any roll, gives a real-world fingerprint score.
- `regenerate_assets.py`: re-render only the CSS variables block (palette + fonts) without touching templates. Useful when only visual identity changed.

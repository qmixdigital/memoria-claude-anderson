const fs=require('fs'),path=require('path');
const cfg=JSON.parse(fs.readFileSync('/opt/portal-engine/sites.json','utf8'));
const sites=Array.isArray(cfg)?cfg:(cfg.sites||Object.values(cfg));
const RE=/\b(apostas?|apostar|apostador(es)?|bets?|bet365|betano|betfair|sportingbet|superbet|pixbet|blaze|estrela ?bet|bet ?nacional|kto|novibet|stake|cassinos?|casinos?|odds|palpites?|tigrinho|fortune tiger|jogo do tigre|ca[çc]a[- ]n[ií]quel|slots?|roleta|aviator|spaceman|crash game|iGaming|bookmaker|casa de apostas|b[oô]nus de boas[- ]vindas|free ?spins?|rodadas gr[aá]tis|jogo do bicho|mines)\b/i;
const out=[];
for(const s of sites){ if(!s||!s.slug) continue;
  const root=s.root||path.join('/srv/portais',s.slug); const dd=path.join(root,'data'); if(!fs.existsSync(dd)) continue;
  let home=''; try{home=fs.readFileSync(path.join(root,'public','index.html'),'utf8')}catch(e){}
  for(const f of fs.readdirSync(dd)){ if(!f.endsWith('.json')) continue; let a; try{a=JSON.parse(fs.readFileSync(path.join(dd,f),'utf8'))}catch(e){continue}
    const t=(a.title||'')+' | '+(a.slug||'')+' | '+(a.category&&a.category.name||'');
    const m=t.replace(/-/g,' ').match(RE); if(!m) continue;
    out.push([s.slug,s.baseUrl||s.domain,a.slug,(a.category&&a.category.slug)||'',home.includes('/'+a.slug+'/')?'HOME':'-',m[0],a.hideHome?'H':'',(a.title||'').slice(0,110)].join('\t'));
  }}
console.log(out.join('\n'));

import json,subprocess,sys
V='C:/Users/User/.claude/skills/materias-jornalisticas-linkbuilding/scripts/validador_materia.py'
for sl in ['melhores-apps-e-sites-de-treino-de-forca-para-quem-joga-futebol','melhores-apps-e-sites-de-calistenia-para-evoluir-nas-barras']:
    j=json.load(open(sl+'.json',encoding='utf-8'))
    o=subprocess.run([sys.executable,V,sl+'.html','--links','3','--titulo',j['titulo'],'--kw',j['palavra_chave'],'--resumo',j['linha_fina']],capture_output=True,text=True,encoding='utf-8').stdout
    print('\n'.join(o.splitlines()[3:60]))

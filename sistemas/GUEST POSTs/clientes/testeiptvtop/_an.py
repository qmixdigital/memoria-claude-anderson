import re,sys,statistics,io
sys.stdout.reconfigure(encoding='utf-8')
h=io.open(sys.argv[1],encoding='utf-8').read()
h=re.sub(r'<aside[\s\S]*?</aside>','',h)
ps=[re.sub(r'<[^>]+>','',x) for x in re.findall(r'<p>([\s\S]*?)</p>',h)]
pal=lambda t:re.findall(r"\b[\wÀ-ÿ%]+\b",t)
tp=[len(pal(p)) for p in ps]
print('palavras p:',sum(tp),'CV',round(statistics.pstdev(tp)/statistics.fmean(tp),2),'n',len(tp))
tot=len(pal(re.sub(r'<[^>]+>',' ',h)));print('total',tot)
w=[x.lower() for p in ps for x in pal(p)]
tri=[' '.join(w[i:i+3]) for i in range(len(w)-2)]
kw=sys.argv[2].lower()
from collections import Counter
c=Counter(tri)
print([ (t,n) for t,n in c.items() if n>=3 and t not in kw])
print([len(pal(s)) for s in re.split(r'(?<=[.!?])\s+',' '.join(ps)) if len(pal(s))>45])
print(tp)

"""Hilfsskript M8a (Analyse, keine Projektlogik): wertet die YAML-Quellen der dnd5e-Compendien (packs/_source, Release 5.3.3) aus
und zaehlt Verweisformate je Feldpfad. Aufruf: python3 scan-refs.py <pfad>/packs/_source /tmp/meta.json
Benoetigt PyYAML. Nur lesend."""
import os,re,sys,yaml,collections,json
try:
    Loader=yaml.CSafeLoader
except AttributeError:
    Loader=yaml.SafeLoader
root=sys.argv[1]
UUID=re.compile(r'Compendium\.[\w-]+\.[\w-]+\.(?:Item|Actor|JournalEntry|RollTable|Scene|Macro|Adventure|Cards|Playlist)\.[A-Za-z0-9]{16}(?:\.[A-Za-z]+\.[A-Za-z0-9]{16})*')
PATS={
 'uuid_string':UUID,
 '@UUID[':re.compile(r'@UUID\['),
 '@Compendium[':re.compile(r'@Compendium\['),
 '@Embed[':re.compile(r'@Embed\['),
 '@Item/@Actor/@JournalEntry[id]':re.compile(r'@(?:Item|Actor|JournalEntry|RollTable|Scene|Macro)\['),
 'data-uuid/data-*-uuid':re.compile(r'data-[\w-]*uuid='),
 '&Reference[':re.compile(r'&Reference\['),
 '[[/… activity=':re.compile(r'\[\[/[a-z]+[^\]]*activity='),
}
IDLIKE=re.compile(r'^[A-Za-z0-9]{16}$')
def norm(path):
    out=[]
    for p in path:
        if isinstance(p,int): out.append('[]')
        elif IDLIKE.match(p) or re.match(r'^dnd5e[a-z]+\d+$',p): out.append('<id>')
        else: out.append(p)
    return '.'.join(out).replace('.[]','[]')
counts=collections.Counter(); byfield=collections.defaultdict(lambda: collections.Counter()); ex={}
docs=collections.Counter(); docs_with=collections.Counter(); targets=collections.Counter()
nfiles=0
def walk(o,path,ctx):
    if isinstance(o,dict):
        for k,v in o.items(): walk(v,path+[str(k)],ctx)
    elif isinstance(o,list):
        for i,v in enumerate(o): walk(v,path+[i],ctx)
    elif isinstance(o,str):
        for name,rx in PATS.items():
            ms=rx.findall(o)
            if ms:
                key=(ctx['type'],norm(path),name)
                counts[key]+=len(ms)
                ctx['hit'].add(name)
                if key not in ex: ex[key]=(ctx['file'],ms[0][:110])
                if name=='uuid_string':
                    for m in ms:
                        mm=re.match(r'Compendium\.([\w-]+\.[\w-]+)',m)
                        targets[(ctx['pack'],mm.group(1))]+=1
for dp,dn,fn in os.walk(root):
    for f in fn:
        if not f.endswith('.yml'): continue
        p=os.path.join(dp,f)
        pack=os.path.relpath(dp,root).split(os.sep)[0]
        try:
            d=yaml.load(open(p,encoding='utf-8'),Loader=Loader)
        except Exception as e:
            continue
        if not isinstance(d,dict): continue
        nfiles+=1
        t=d.get('type') or ('page:'+str(d.get('pages',[{}])[0].get('type')) if d.get('pages') else 'doc')
        # Dokumentart aus Pack + type
        ctx={'type':f'{pack}/{t}','file':os.path.relpath(p,root),'pack':pack,'hit':set()}
        docs[ctx['type']]+=1
        walk(d,[],ctx)
        for h in ctx['hit']: docs_with[(ctx['type'],h)]+=1
out={'files':nfiles,
 'by_pattern':collections.Counter(),
 'fields':[]}
for (t,path,name),c in counts.items():
    out['by_pattern'][name]+=c
rows=sorted(counts.items(), key=lambda x:-x[1])
print('Dateien:',nfiles)
print('Treffer je Muster:',dict(out['by_pattern']))
print()
print('Feldpfade (normalisiert), Muster, Trefferzahl, Beispieldatei:')
seen=set()
# aggregate over doc type to path+pattern
agg=collections.defaultdict(lambda:[0,None,set()])
for (t,path,name),c in counts.items():
    k=(path,name)
    agg[k][0]+=c; agg[k][2].add(t.split('/')[0])
    if agg[k][1] is None: agg[k][1]=ex[(t,path,name)]
for (path,name),(c,e,packs) in sorted(agg.items(), key=lambda x:-x[1][0])[:45]:
    print(f'{c:6d}  {name:22s} {path[:95]}  | packs:{len(packs)} | {e[0][:40]}')
print()
print('Ziel-Compendien der UUID-Verweise (nach Quellpack -> Zielpack, Top 15):')
for (a,b),c in targets.most_common(15): print(f'  {c:6d} {a} -> {b}')
json.dump({'total_files':nfiles},open(sys.argv[2],'w'))

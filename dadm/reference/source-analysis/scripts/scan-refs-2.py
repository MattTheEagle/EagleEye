"""Hilfsskript M8a (Analyse): zaehlt relative Links, Weltverweise und Ziele ausserhalb von dnd5e.
Aufruf: python3 scan-refs-2.py <pfad>/packs/_source . Benoetigt PyYAML. Nur lesend."""
import os,re,sys,yaml,collections
Loader=getattr(yaml,'CSafeLoader',yaml.SafeLoader)
root=sys.argv[1]
rel=re.compile(r'@(?:UUID|Embed)\[\.[^\]]*\]')
worldabs=re.compile(r'@(?:UUID|Embed)\[(?:Item|Actor|JournalEntry|Scene|RollTable|Macro)\.[A-Za-z0-9]{16}')
uuidfull=re.compile(r'Compendium\.[\w-]+\.[\w-]+\.[A-Za-z]+\.[A-Za-z0-9]{16}')
c=collections.Counter(); samples={}
withref=0; total=0; consum=[]; comp_ext=collections.Counter()
def walk(o,path,f,state):
    if isinstance(o,dict):
        for k,v in o.items(): walk(v,path+[str(k)],f,state)
    elif isinstance(o,list):
        for v in o: walk(v,path+['[]'],f,state)
    elif isinstance(o,str):
        if rel.search(o): c['relativ @UUID[.…]/@Embed[.…]']+=len(rel.findall(o)); samples.setdefault('rel',(f,rel.search(o).group(0)))
        if worldabs.search(o): c['welt-absolut @UUID[Item.id]']+=1; samples.setdefault('welt',(f,worldabs.search(o).group(0)))
        if uuidfull.search(o): state['ref']=True
        if path[-1:]==['target'] and 'consumption' in path and uuidfull.search(o): consum.append(o[:90])
        for m in uuidfull.findall(o):
            pk=m.split('.')[1]
            if pk!='dnd5e': comp_ext[pk]+=1
for dp,dn,fn in os.walk(root):
    for f in fn:
        if not f.endswith('.yml'): continue
        try: d=yaml.load(open(os.path.join(dp,f),encoding='utf-8'),Loader=Loader)
        except Exception: continue
        if not isinstance(d,dict): continue
        total+=1; st={'ref':False}; walk(d,[],f,st)
        if st['ref']: withref+=1
print('Dokumente gesamt:',total,'| mit mindestens einem Compendium-UUID-Verweis:',withref)
print(dict(c)); print('Beispiele:',samples)
print('Verbrauchsziel-Beispiele:',consum[:3])
print('Ziel-Pakete außerhalb dnd5e:',dict(comp_ext))

"""Runs inside the disposable TeX container, never directly on the app host."""
import base64, json, os, pathlib, re, resource, subprocess, sys

def run():
    raw=sys.stdin.buffer.read(12*1024*1024+1)
    if len(raw)>12*1024*1024: raise ValueError('Loyiha juda katta.')
    data=json.loads(raw)
    engine=data.get('engine','xelatex')
    if engine not in ('xelatex','pdflatex','lualatex'): raise ValueError('Kompilyator noto‘g‘ri.')
    source=data.get('source')
    if not isinstance(source,str) or len(source)>500000: raise ValueError('TeX manba hajmini tekshiring.')
    work=pathlib.Path.cwd()
    if str(work)!='/work': raise ValueError('Worker /work ichida ishlashi kerak.')
    assets=data.get('assets',[])
    if not isinstance(assets,list) or len(assets)>20: raise ValueError('20 tagacha yordamchi fayl.')
    total=0
    for a in assets:
        name=a['name']
        if not re.fullmatch(r'[A-Za-z0-9_./ -]{1,160}',name) or name.startswith('/') or any(x in ('','.','..') for x in name.split('/')) or name.lower() in ('main.tex','main.pdf','main.log','main.aux'): raise ValueError('Fayl yo‘li noto‘g‘ri.')
        if pathlib.Path(name).suffix.lower() not in ('.tex','.sty','.cls','.bib','.csv','.dat','.pgf','.tikz','.pdf','.png','.jpg','.jpeg','.eps','.ttf','.otf','.lua'): raise ValueError('Yordamchi fayl formati noto‘g‘ri.')
        blob=base64.b64decode(a['base64'],validate=True);total+=len(blob)
        if total>8*1024*1024: raise ValueError('Yordamchi fayllar 8 MB dan oshmasin.')
        p=work/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(blob)
    (work/'main.tex').write_text(source,encoding='utf-8')
    resource.setrlimit(resource.RLIMIT_FSIZE,(12*1024*1024,12*1024*1024))
    flags=['-no-shell-escape','-interaction=nonstopmode','-halt-on-error','-file-line-error','-jobname=main']
    if engine=='lualatex': flags+=['--nosocket']
    log=''
    for _ in range(2):
        # Bounded regular file, not an unbounded PIPE. RLIMIT_FSIZE caps writes.
        with open(work/'compiler.txt','wb') as out:
            result=subprocess.run([engine,*flags,'main.tex'],stdout=out,stderr=subprocess.STDOUT,timeout=25,check=False)
        with open(work/'compiler.txt','rb') as stream:
            stream.seek(0,2);stream.seek(max(0,stream.tell()-12000));log=stream.read().decode('utf-8','replace')
        if result.returncode: return {'ok':False,'error':'LaTeX kompilyatsiyasi tugamadi. Jurnalni tekshiring.','log':log}
    pdf=(work/'main.pdf').read_bytes()
    if not pdf.startswith(b'%PDF-') or len(pdf)>10*1024*1024: raise ValueError('PDF yaratilmagan yoki 10 MB dan katta.')
    return {'ok':True,'pdf':base64.b64encode(pdf).decode(),'log':log}
try: print(json.dumps(run(),ensure_ascii=False))
except subprocess.TimeoutExpired: print(json.dumps({'ok':False,'error':'LaTeX vaqt limiti tugadi (25 soniya/bosqich).'}))
except Exception as e: print(json.dumps({'ok':False,'error':str(e)[:300]}))

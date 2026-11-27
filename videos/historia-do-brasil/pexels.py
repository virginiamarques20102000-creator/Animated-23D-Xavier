# busca clipes verticais na Pexels (licença Pexels: uso livre, sem atribuição obrigatória) e prepara 1080x1920/30fps
import json,sys,os,subprocess,urllib.request,urllib.parse
H={'Authorization':'pexels-key-injected-by-proxy','User-Agent':'BrasilHistoryVideo/1.0'}
CLIPS=json.load(open('clips.json'))
os.makedirs('vidraw',exist_ok=True); os.makedirs('app/public/vid',exist_ok=True)
cred=json.load(open('pexels_credits.json')) if os.path.exists('pexels_credits.json') else {}
for name,q in CLIPS.items():
    out=f'app/public/vid/{name}.mp4'
    if os.path.exists(out): continue
    u='https://api.pexels.com/videos/search?'+urllib.parse.urlencode(dict(query=q,orientation='portrait',per_page=10))
    r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=60))
    best=None
    for v in r.get('videos',[]):
        if v['duration']<4: continue
        fs=[f for f in v['video_files'] if f.get('height') and f['height']>=f['width'] and f['height']>=1280 and f.get('file_type')=='video/mp4']
        if not fs: continue
        f=min(fs,key=lambda f:abs(f['height']-1920)); best=(v,f); break
    if not best: print('NADA',name,q,flush=True); continue
    v,f=best; raw=f'vidraw/{name}.mp4'
    urllib.request.urlretrieve(f['link'],raw) if False else open(raw,'wb').write(urllib.request.urlopen(urllib.request.Request(f['link'],headers={'User-Agent':'Mozilla/5.0'}),timeout=300).read())
    ss=min(1.0,max(0,v['duration']-4))
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(ss),'-i',raw,'-t','3.5','-an','-vf','scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p','-c:v','libx264','-crf','17','-preset','fast',out],check=True)
    cred[name]=dict(query=q,url=v['url'],author=v['user']['name'],license='Pexels License (uso livre)')
    print('OK',name,v['url'],flush=True)
    json.dump(cred,open('pexels_credits.json','w'),ensure_ascii=False,indent=1)

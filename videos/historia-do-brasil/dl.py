import sys,time,urllib.request,urllib.error,os
UA={'User-Agent':'BrasilHistoryVideo/1.0 (personal educational video)'}
jobs=[l.split(' ',1) for l in open(sys.argv[1]).read().split('\n') if l.strip()]
for key,url in jobs:
    out=f'img/{key}.jpg'
    if os.path.exists(out) and os.path.getsize(out)>0: continue
    while True:
        try:
            data=urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=120).read()
            open(out+'.part','wb').write(data); os.rename(out+'.part',out); print('OK',key,len(data),time.strftime('%X'),flush=True); time.sleep(5); break
        except urllib.error.HTTPError as e:
            if e.code==404: print("404",key,flush=True); break
            ra=int(e.headers.get('retry-after') or 60); print('429',key,'wait',ra,time.strftime('%X'),flush=True); time.sleep(ra+5)
        except Exception as e:
            print('ERR',key,e,flush=True); time.sleep(30)

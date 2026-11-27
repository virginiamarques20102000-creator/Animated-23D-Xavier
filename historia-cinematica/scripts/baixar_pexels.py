#!/usr/bin/env python3
"""Busca clipes VERTICAIS na Pexels e prepara cada um em 1080x1920, 30 fps, sem som, 3,5 s.

uso: python3 baixar_pexels.py <pasta_do_projeto> clips.json
clips.json: {"mar": "ocean waves sailing ship", "cavalos": "horses galloping", ...}

A chave: o jeito seguro é um "Network secret" do ambiente (host api.pexels.com, header Authorization,
valor = a chave pura, sem "Bearer"): o proxy injeta a chave e ela nunca aparece no código nem no chat.
Fora disso, o script lê a variável de ambiente PEXELS_API_KEY.
Licença Pexels: uso livre, inclusive comercial, sem crédito obrigatório. O script grava a origem de cada
clipe em creditos_pexels.json para o caso de uma reivindicação de Content ID por engano.
"""
import json, os, sys, subprocess, urllib.request, urllib.parse
proj, clips = sys.argv[1], json.load(open(sys.argv[2]))
key = os.environ.get('PEXELS_API_KEY', 'injetada-pelo-proxy')
H = {'Authorization': key, 'User-Agent': 'HistoriaCinematica/1.0'}
os.makedirs(f'{proj}/vidraw', exist_ok=True); os.makedirs(f'{proj}/public/vid', exist_ok=True)
cf = f'{proj}/creditos_pexels.json'
cred = json.load(open(cf)) if os.path.exists(cf) else {}
for name, q in clips.items():
    out = f'{proj}/public/vid/{name}.mp4'
    if os.path.exists(out): continue
    u = 'https://api.pexels.com/videos/search?' + urllib.parse.urlencode(dict(query=q, orientation='portrait', per_page=12))
    try:
        r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60))
    except urllib.error.HTTPError as e:
        sys.exit(f'Pexels respondeu {e.code}: ' + ('sem chave válida (veja o cabeçalho deste script)' if e.code == 401 else 'erro'))
    best = None
    for v in r.get('videos', []):
        if v['duration'] < 4: continue
        fs = [f for f in v['video_files'] if f.get('height') and f['height'] >= f['width'] and f['height'] >= 1280 and f.get('file_type') == 'video/mp4']
        if fs: best = (v, min(fs, key=lambda f: abs(f['height'] - 1920))); break
    if not best: print('nenhum clipe vertical para', name, q); continue
    v, f = best; raw = f'{proj}/vidraw/{name}.mp4'
    open(raw, 'wb').write(urllib.request.urlopen(urllib.request.Request(f['link'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=300).read())
    ss = min(1.0, max(0, v['duration'] - 4))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-i', raw, '-t', '3.5', '-an', '-vf',
                    'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p',
                    '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', out], check=True)
    cred[name] = dict(busca=q, pagina=v['url'], autor=v['user']['name'], licenca='Pexels License')
    json.dump(cred, open(cf, 'w'), ensure_ascii=False, indent=1)
    print('OK', name, v['url'])

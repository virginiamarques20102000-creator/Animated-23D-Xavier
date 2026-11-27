#!/usr/bin/env python3
"""Busca e baixa imagens/vídeos do Wikimedia Commons, só em domínio público (ou CC0), respeitando o limite do site.

uso:
  python3 baixar_commons.py buscar "Independência ou Morte Pedro Américo" ["outro termo" ...]
      -> lista arquivos com licença, tamanho e título
  python3 baixar_commons.py baixar <pasta_saida> <nome>="File:Título exato.jpg" [...]
      -> confere a licença pela API e baixa (3840 px de largura no máximo); grava creditos.json

A Wikimedia devolve 429 (muitas requisições) com Retry-After; o script espera exatamente o tempo pedido.
Insistir antes do prazo só estende o bloqueio. Em IPs de nuvem o bloqueio pode durar horas: planeje sem depender dele.
"""
import json, os, sys, time, hashlib, urllib.request, urllib.parse, urllib.error
UA = {'User-Agent': 'HistoriaCinematica/1.0 (educational video maker)'}
OK = {'Public domain', 'CC0', 'Public Domain Mark 1.0'}

def get(url, timeout=120):
    while True:
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()
        except urllib.error.HTTPError as e:
            if e.code == 404: raise
            if e.code not in (429, 503): raise
            ra = int(e.headers.get('retry-after') or 60)
            print(f'  limite do site ({e.code}); esperando {ra}s', flush=True); time.sleep(ra + 5)
        except Exception as e:
            print('  erro de rede:', e, flush=True); time.sleep(30)

def api(**p):
    p.update(format='json', formatversion=2)
    return json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(p)))

def info(titles):
    r = api(action='query', titles='|'.join(titles), prop='imageinfo', iiprop='url|size|extmetadata|mime',
            iiextmetadatafilter='LicenseShortName|Artist|DateTimeOriginal')
    norm = {n['from']: n['to'] for n in r['query'].get('normalized', [])}
    pages = {p['title']: p for p in r['query']['pages']}
    return {t: pages.get(norm.get(t, t)) for t in titles}

def url_for(title, width):
    n = title.split(':', 1)[1].replace(' ', '_'); h = hashlib.md5(n.encode()).hexdigest(); q = urllib.parse.quote(n)
    base = 'https://upload.wikimedia.org/wikipedia/commons'
    return f'{base}/{h[0]}/{h[:2]}/{q}' if not width else f'{base}/thumb/{h[0]}/{h[:2]}/{q}/{width}px-{q}'

if sys.argv[1] == 'buscar':
    for term in sys.argv[2:]:
        r = api(action='query', generator='search', gsrsearch=term, gsrnamespace=6, gsrlimit=8, prop='imageinfo',
                iiprop='size|extmetadata|mime', iiextmetadatafilter='LicenseShortName')
        print('##', term)
        for p in r.get('query', {}).get('pages', []):
            ii = p['imageinfo'][0]
            print(f"  {ii['extmetadata'].get('LicenseShortName', {}).get('value')} | {ii['width']}x{ii['height']} | {ii.get('mime')} | {p['title']}")
        time.sleep(4)
else:
    out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    pairs = [a.split('=', 1) for a in sys.argv[3:]]
    meta = info([t for _, t in pairs]); cred = []
    cf = f'{out}/creditos.json'
    if os.path.exists(cf): cred = json.load(open(cf))
    for key, title in pairs:
        p = meta.get(title)
        if not p or 'imageinfo' not in p: print('não encontrado:', title); continue
        ii = p['imageinfo'][0]; lic = ii['extmetadata'].get('LicenseShortName', {}).get('value')
        if lic not in OK: print(f'pulado ({lic}):', title); continue
        video = ii.get('mime', '').startswith('video')
        ext = '.webm' if video else '.jpg'
        dest = f'{out}/{key}{ext}'
        if os.path.exists(dest) and os.path.getsize(dest) > 0: continue
        w = None if video or ii['width'] <= 3840 else 3840
        if w and title.lower().endswith(('.tif', '.tiff')): w = 3840
        data = get(url_for(title, w), timeout=300)
        open(dest + '.part', 'wb').write(data); os.rename(dest + '.part', dest)
        artist = ii['extmetadata'].get('Artist', {}).get('value', '')
        cred.append(dict(arquivo=os.path.basename(dest), titulo=title, licenca=lic, autor=artist,
                         pagina='https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'))))
        json.dump(cred, open(cf, 'w'), ensure_ascii=False, indent=1)
        print('OK', key, len(data), flush=True); time.sleep(5)

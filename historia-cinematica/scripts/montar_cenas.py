#!/usr/bin/env python3
"""Gera src/scenes.ts e public/img/*.jpg a partir de um roteiro de edição (edit.json).

uso: python3 montar_cenas.py <edit.json> <pasta_imagens_originais> <pasta_do_projeto>

edit.json: {"end_start": quadro em que começa a bandeira/fecho, "total": quadros totais,
            "shots": [...planos...], "beats": [...textos...]}
 plano de pintura : {"start", "img", "cam": [[cx,cy,zoom],[cx,cy,zoom]], "tIn", opcionais "tilt","rot","grade","ease"}
 plano de clipe   : idem + "video": nome em public/vid/<nome>.mp4 (cai para a pintura "img" se o clipe não existir)
 plano animado    : {"start", "mg": ocean|gold|chains|map|rays|law|stars, "tIn", opcional "v"}
 "end" é calculado pelo início do próximo plano.
"""
import json, os, sys
from PIL import Image
edit, src, proj = sys.argv[1:4]
C = json.load(open(edit))
os.makedirs(f'{proj}/public/img', exist_ok=True)
shots = C['shots']
for i, s in enumerate(shots):
    s.setdefault('end', shots[i + 1]['start'] if i + 1 < len(shots) else C['end_start'] + 6)
sizes = {}
for s in shots:
    if s.get('video') and not os.path.exists(f"{proj}/public/vid/{s['video']}.mp4"):
        print('aviso: clipe ausente, usando a pintura:', s['video']); s.pop('video')
    if s.get('mg'):
        s['img'] = ''; s['w'], s['h'] = 1080, 1920; s.setdefault('cam', [[.5, .5, 1], [.5, .5, 1]]); continue
    k = s['img']
    if k not in sizes:
        im = Image.open(f'{src}/{k}.jpg')
        if im.height > 2600: im = im.resize((round(im.width * 2600 / im.height), 2600), Image.LANCZOS)
        im.convert('RGB').save(f'{proj}/public/img/{k}.jpg', quality=90); sizes[k] = im.size
    s['w'], s['h'] = sizes[k]
total = C.get('total', C['end_start'] + 180)
open(f'{proj}/src/scenes.ts', 'w').write(f'''export type Shot={{img:string;w:number;h:number;start:number;end:number;cam:[number,number,number][];tilt?:[number,number];rot?:number;ease?:string;grade?:string;
video?:string;mg?:string;v?:number;from?:number;tIn:'whipL'|'whipR'|'whipU'|'zoom'|'blurzoom'|'flash'|'leak'|'cut'}};
export type Beat={{start:number;end:number;year?:[number,number];label?:string;big?:string;bigAt?:number;caption?:string;capDelay?:number;tick?:string;shake?:number[]}};
export const TOTAL={total}; export const END_START={C['end_start']};
export const SHOTS:Shot[]={json.dumps(shots, ensure_ascii=False)};
export const BEATS:Beat[]={json.dumps(C['beats'], ensure_ascii=False)};
''')
print(f'ok: {len(shots)} planos, {total} quadros ({total/30:.1f} s). Lembre de ajustar durationInFrames em Root.tsx.')

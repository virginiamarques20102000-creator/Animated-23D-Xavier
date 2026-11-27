import json,os
from PIL import Image
C=json.load(open('edit.json'))
sizes={}
W0,H0=1080,1920
for s in C['shots']:
    if s.get('video') and not os.path.exists(f"app/public/vid/{s['video']}.mp4"): s.pop('video')
    if s.get('mg'): s['img']='';s['w']=W0;s['h']=H0;continue
    k=s['img']
    if k not in sizes:
        src=f'img/{s.get("src",k)}.jpg' if os.path.exists(f'img/{s.get("src",k)}.jpg') and os.path.getsize(f'img/{s.get("src",k)}.jpg')>0 else 'img/cabral.jpg'
        im=Image.open(src); w,h=im.size
        if h>2600: im=im.resize((round(w*2600/h),2600),Image.LANCZOS); w,h=im.size
        im.convert('RGB').save(f'app/public/img/{k}.jpg',quality=90); sizes[k]=(w,h)
    s['w'],s['h']=sizes[k]
open('app/src/scenes.ts','w').write('''export type Shot={img:string;w:number;h:number;start:number;end:number;cam:[number,number,number][];tilt?:[number,number];rot?:number;ease?:string;grade?:string;
video?:string;mg?:string;v?:number;from?:number;tIn:'whipL'|'whipR'|'whipU'|'zoom'|'blurzoom'|'flash'|'leak'|'cut'};
export type Beat={start:number;end:number;year?:[number,number];label?:string;big?:string;bigAt?:number;caption?:string;capDelay?:number;tick?:string;shake?:number[]};
export const TOTAL=1470; export const END_START=%d;
export const SHOTS:Shot[]=%s;
export const BEATS:Beat[]=%s;
'''%(C['end_start'],json.dumps(C['shots'],ensure_ascii=False),json.dumps(C['beats'],ensure_ascii=False)))
print('ok',len(C['shots']),sizes)

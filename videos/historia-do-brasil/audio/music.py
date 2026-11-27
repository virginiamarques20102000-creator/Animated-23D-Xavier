import sys; sys.dont_write_bytecode=True
import sys; sys.path.insert(0,'/home/user/Animated-23D-Xavier/templates/audio')
import numpy as np
from dsp import *
from instruments import m2f, pad, pluck, timpani, cymbal
T=40.0; N=ns(T); r=rng(7)
mus=np.zeros((2,N)); hits=np.zeros((2,N))
CUTS=[f/30 for f in [66,132,192,258,318,384,444,510,576,636,690,756,810,876,930,996,1050]]
BIG=[636/30,690/30,1050/30]
# (start,end, chord midi notes, arpeggio notes)
B=[0,6.5,10.7,17.1,21.2,27.1,31.1,35,40]
prog=[(0,5,[38,50,53,57],[62,65,69,65]),(5,9,[34,46,50,53],[58,62,65,62]),(9,14,[31,43,46,50],[55,58,62,58]),
      (14,18,[33,45,49,52],[57,61,64,61]),(18,24,[38,50,54,57],[62,66,69,74]),(24,29,[31,43,47,50],[55,59,62,67]),
      (29,34,[33,45,49,52],[57,61,64,69]),(34,40,[38,50,54,57,62],[62,66,69,74])]
prog=[(B[i],B[i+1],p[2],p[3]) for i,p in enumerate(prog)]
for a,b,ch,arp in prog:
    vel=0.35 if a<21 else 0.5
    place(mus,pad([m2f(m) for m in ch],b-a+0.3,vel,r,att=0.5 if a else 2.5,rel=1.2,warm=700 if a<21 else 1300),a)
    # bass
    place(mus,pan(pluck(m2f(ch[0]),0.9,r,dur=2.0,bright=0.2)),a,0.8)
    if a>=5:
        step=0.25 if a<10 else 0.125
        t=a; i=0
        while t<b-0.01 and t<38:
            v=(0.35+0.25*(a/40))*(1.0 if i%4==0 else 0.7)
            place(mus,pan(pluck(m2f(arp[i%4]+(12 if (a>=21 and i%8>=4) else 0)),v,r,dur=0.7,bright=0.6),0.3*np.sin(i)),t)
            t+=step; i+=1
# low pulse from 14s
t=10.7
while t<38:
    v=0.35 if t<21 else 0.5
    place(mus,timpani(m2f(38 if t<31 else 33),v,r,dur=1.2),t); t+=0.5
# whooshes into cuts + hits
def whoosh(d=0.6):
    n=ns(d); tt_=np.arange(n)/SR; x=r.standard_normal(n)
    env=(tt_/d)**2.5; y=np.zeros(n)
    for k,f in enumerate(np.linspace(300,4000,12)):
        seg=slice(k*n//12,(k+1)*n//12); y[seg]=bp(x,f*0.7,f*1.4,2)[seg]
    return widen(lp(y,6000)*env*0.9,r)
for c in CUTS:
    place(hits,whoosh(0.45),c-0.45,0.5)
    big=any(abs(c-x)<0.01 for x in BIG)
    place(hits,timpani(m2f(26),1.0 if big else 0.45,r,dur=2.5),c)
    if big: place(hits,widen(cymbal(0.7,r,dur=3.0),r),c)
    boom=lp(r.standard_normal(ns(2)),120,2)*np.exp(-tt(2)/0.5)*(2.0 if big else 0.5)
    place(hits,boom,c)
place(hits,timpani(m2f(26),1.0,r,dur=3),0.05); place(hits,widen(cymbal(0.4,r,dur=3),r),0.05)
ir=make_ir(2.2,3)
mix=convolve_st(mus,ir)[:, :N]*0.35+mus*0.8 + convolve_st(hits,ir)[:, :N]*0.3+hits
# final fade
fo=ns(2.0); mix[:,-fo:]*=np.linspace(1,0,fo)**1.5
mix=norm_to(mix,-14,'integrated') if True else mix
pk=np.max(np.abs(mix)); mix*=min(1,0.89/pk)
write_wav('/tmp/claude-0/-home-user-Animated-23D-Xavier/5b33265a-0643-58d3-bf03-4e4a7bccf5a7/scratchpad/hb/audio/music.wav',mix)
print('ok',integrated(mix))

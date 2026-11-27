# Edição dinâmica (pinturas, clipes e cenas animadas)

Motor: `templates/projeto/src/Video.tsx` (composição `Brasil`), alimentado por `src/scenes.ts`, que é gerado pelo
`scripts/montar_cenas.py` a partir de um `edit.json` (exemplo completo de 49 s: `templates/edit_exemplo_49s.json`).

## Ritmo que o usuário aprovou
- Planos de **1,1–1,8 s** (33–55 quadros). Nada parado: a câmera sempre se move (70% easing + 30% linear).
- Alternar tipos: pintura em close → clipe/cena animada → outro close da mesma pintura → plano aberto.
- Uma pintura rende 2–3 planos: escolha detalhes diferentes (rosto, mão, navio, multidão) com `cam` e `zoom` 1,6–3.
- Impactos (ano importante, frase famosa): `flash` + tremor (`shake`) + texto que "bate" na tela.

## Câmera em pintura (`cam: [[cx,cy,zoom],[cx,cy,zoom]]`)
- cx/cy = ponto da pintura no centro da tela (0–1); zoom 1 = altura da pintura cabe na tela vertical.
- Paisagem horizontal em tela vertical: pan lateral de cx 0,15→0,35 é o movimento mais rico.
- `tilt` = giro 3D em Y (graus, ex. [6,−2]): dá profundidade 2.5D. `rot` = giro no plano. `grade` = filtro CSS
  (ex. `brightness(1.35)` para pintura escura).
- Antes de escolher cx/cy, **olhe a pintura** (miniatura 900 px) e anote onde estão rostos e ação.

## Transições (`tIn`, do plano que entra)
`whipL/whipR/whipU` chicote com desfoque · `zoom` atravessa · `blurzoom` recua desfocado · `flash` corte branco com
"punch" · `leak` luz vazada laranja · `cut` corte seco com punch. Varie; não repita a mesma duas vezes seguidas.

## Textos (`beats`), independentes dos cortes
- `year:[de,até]` conta o ano (ex. 1600→1808) com mola; `label` para palavra (ex. "COLÔNIA").
- `caption` palavra por palavra; `*palavra*` sai em amarelo (marque cada palavra com asteriscos).
- `big` + `bigAt` para a frase de impacto; `tick` cria marco na linha do tempo do rodapé; `shake` = quadros do tremor.
- Legendas na faixa y≈1300–1420, anos em y≈200; deixe a zona de 1300–1500 livre de elementos das cenas animadas.
- Duas legendas não podem se sobrepor: a primeira termina antes de a segunda começar.

## Cenas animadas prontas (`mg`)
`ocean` mar com caravelas (v=1: close) · `gold` chuva de ouro + canavial · `chains` correntes + contador ·
`map` rota Lisboa→Rio · `rays` raios dourados + coroa · `law` documento sendo escrito + corrente partindo ·
`stars` céu com Cruzeiro do Sul + faixa "Ordem e Progresso". Fecho: bandeira tremulando (`Flag.tsx`).
Use-as quando faltar imagem, ou para variar o ritmo. Para um tema novo, crie outra no mesmo molde em `mg.tsx`.

## Clipes (`video`)
Arquivo `public/vid/<nome>.mp4` já em 1080×1920/30 fps (o `baixar_pexels.py` prepara). Se não existir, o plano usa a
pintura de `img`: dá para montar o vídeo antes de os clipes chegarem.

## Áudio
O usuário narra no ElevenLabs: entregue **sem áudio**. Trilha opcional por código: `scripts/trilha_opcional.py`
(ajuste os tempos de corte), renderize com `--props='{"music":true}'` se ele pedir a versão com música.

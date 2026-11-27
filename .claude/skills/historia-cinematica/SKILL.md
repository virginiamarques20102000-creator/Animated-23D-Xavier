---
name: historia-cinematica
description: >-
  Faz shorts verticais (1080x1920) de história no estilo cinematográfico: cenas 3D feitas por código (three.js no Remotion — mar com caravelas, paisagens ao pôr do sol, cavaleiros em silhueta, espada erguida contra o sol) misturadas com pinturas e fotos reais em domínio público (Wikimedia Commons) com câmera 2.5D, clipes de vídeo de bancos gratuitos (Pexels), cenas animadas (mapa de rota, chuva de ouro, documento sendo escrito, céu com o Cruzeiro do Sul), cortes rápidos, transições em chicote/zoom/flash, anos e legendas animados, sem risco de strike, entregue sem áudio para narração no ElevenLabs. Use sempre que o usuário pedir um vídeo, short, reels ou TikTok de história (do Brasil ou qualquer outra), "vídeo dinâmico com fotos e vídeos", "no estilo das caravelas / do Dom Pedro", "3D realista misturado com fotos", "imagens de banco sem tomar strike", ou um curta sobre um personagem ou fato histórico — mesmo que não diga "3D" nem "skill".
---

# História cinematográfica (3D + imagens reais + edição dinâmica)

O usuário cria vídeos de história para o YouTube/TikTok, narra no **ElevenLabs** e quer receber o vídeo **pronto e sem
áudio**: vertical, dinâmico, nada parado, bonito, e **sem risco de strike**. Ele fala português e não é programador:
explique em linguagem simples, mostre prévias e entregue o MP4 na conversa.

O estilo aprovado mistura três camadas, cada uma onde ela é mais forte:
- **3D por código** para cenário e ação (mar, céu, navios, colinas, cavalos, multidões em silhueta).
- **Pinturas/fotos reais em domínio público** para pessoas, rostos e momentos famosos — rosto "realista" feito por
  código fica artificial; a pintura com câmera em movimento fica verdadeira.
- **Clipes de banco** (Pexels etc.) e **cenas animadas** (`mg`) como apoio e ritmo.

## Passo a passo

### 1. Roteiro em planos (antes de qualquer código)
Escreva a mini-história em 4–8 batidas, cada uma com: tempo, o que se vê, tipo (3D / pintura / clipe / `mg`), texto na
tela, transição. Duração pedida manda (15 s, 30 s, 49 s…). Abra com gancho visual forte nos 2 primeiros segundos, tenha
um pico (frase famosa + flash + tremor) e feche com título. Mostre o roteiro em 5–8 linhas e já siga — só pare se o
usuário tiver pedido para aprovar antes.

Fatos: confira datas, números e citações (ex.: 7/9/1822, Dom Pedro tinha 23 anos, Lei Áurea nº 3.353 de 13/5/1888).
Na dúvida, use formulação segura ("cerca de", "quase").

### 2. Projeto
Copie `templates/projeto/` para o scratchpad (não para o repositório), rode `npm i`, e use o Chromium já instalado:
`--browser-executable=/opt/pw-browsers/chromium_headless_shell` (veja `references/problemas.md`).
Composições prontas em `src/Root.tsx`: `Brasil` (edição 2D com pinturas/clipes/`mg`), `Caravelas` (3D, 30 s),
`DomPedro` (3D, 15 s). Para um vídeo novo, crie uma composição nova copiando a mais parecida.

### 3. Imagens e vídeos (comece cedo, em segundo plano)
- Pinturas/fotos: `scripts/baixar_commons.py buscar "<termos>"` e depois `baixar <pasta> nome="File:..."`.
  Só domínio público/CC0. A Wikimedia limita downloads (pode levar horas em IP de nuvem): dispare logo e monte o resto.
- Clipes: `scripts/baixar_pexels.py <projeto> clips.json` (precisa da chave da Pexels como Network secret do ambiente).
- Sem acesso a uma fonte, **não trave**: troque o plano por 3D ou `mg`, entregue, e diga ao usuário o que faltou e
  como liberar. Detalhes, licenças e lista de fontes: `references/fontes.md`.

### 4. Montagem
- **Planos de pintura/clipe/`mg`**: escreva o `edit.json` (modelo: `templates/edit_exemplo_49s.json`) e rode
  `scripts/montar_cenas.py edit.json <pasta_imagens> <projeto>`. Ritmo, câmera, transições e textos:
  `references/edicao.md`.
- **Planos 3D**: parta de `src/sea/` ou `src/pedro/`; troque cenário, personagens, planos de câmera e textos.
  Leia `references/3d.md` antes — ali estão as armadilhas de exposição, textura e silhueta já resolvidas.
- Para juntar 3D com pinturas no mesmo vídeo, a forma mais simples é renderizar as partes e concatenar com ffmpeg
  (mesmo tamanho/fps), ou colocar o `<ThreeCanvas>` como um plano dentro da composição 2D.

### 5. Conferir antes de renderizar
`scripts/previas.sh <projeto> <Composição> <saida> q1 q2 ...` com um quadro por plano + o pico. Olhe a folha:
exposição (nada estourado em branco nem preto), enquadramento (rosto/cavaleiro/espada dentro da tela), texto inteiro
na tela e sem legendas sobrepostas, câmera fora do chão. Corrija e repita só os quadros com problema.
Diga ao usuário em uma linha o que está fazendo enquanto renderiza — o 3D sem GPU leva alguns minutos.

### 6. Render e entrega
`scripts/render.sh <projeto> <Composição> <saida.mp4>` (em segundo plano). Confira 4–6 quadros do MP4 final, envie o
arquivo com `SendUserFile` e resuma: o que tem em cada trecho, o que é 3D, pintura ou clipe, e o que faltou (com o
motivo e como resolver). Salve código e roteiro no repositório (sem MP4/imagens grandes) se o usuário pedir ou permitir.

## Por que estas escolhas
- **Sem áudio**: a narração do usuário define o tempo final; música de terceiros é o maior risco de reivindicação.
  Há trilha opcional por código em `scripts/trilha_opcional.py`.
- **Cortes de ~1,5 s e câmera sempre em movimento**: o usuário reclamou de vídeo "estático"; esse ritmo foi o aprovado.
- **Silhueta contra o sol** para personagens 3D: o usuário amou o Dom Pedro assim; é dramático e não cai no "vale da
  estranheza".
- **Créditos guardados**: se vier uma reivindicação de Content ID por engano, o usuário contesta com o link da licença.

## Arquivos
- `templates/projeto/` — projeto Remotion completo (2D + 3D), fontes, grão, textura da água, 3 pinturas de exemplo.
- `templates/edit_exemplo_49s.json` — roteiro do vídeo "História do Brasil" de 49 s.
- `scripts/` — `montar_cenas.py`, `baixar_commons.py`, `baixar_pexels.py`, `previas.sh`, `render.sh`, `trilha_opcional.py`.
- `references/` — `fontes.md` (licenças e fontes), `edicao.md` (ritmo, câmera, transições, textos, `mg`),
  `3d.md` (cenas three.js e armadilhas), `problemas.md` (erros conhecidos e consertos).

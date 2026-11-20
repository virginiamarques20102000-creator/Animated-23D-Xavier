---
name: desenho-animado
description: Faz um short vertical de ~15-70 s contando uma história no estilo "bonecos 2D num mundo 3D colorido" (bonecos chapados de cabeça de feijão com contorno, cidade/mundo 3D pintado com contorno preto, céu saturado, fundo desfocado, câmera deslizando, narração, sons e música feitos por código), renderizado com three.js dentro do Remotion. Exemplos prontos: a Torre de Pisa (templates/pisa) e a ponte (templates/bridge). Use quando pedirem "faz um desenho animado contando a história de…", "um short animado nesse estilo", "igual ao da Torre de Pisa", uma história de história/ciência com bonecos em 3D, ou "usa a skill de desenho animado".
---

# Desenho animado 2D/3D (three.js + Remotion)

Exemplos prontos:
- **A Torre de Pisa** (`templates/pisa/`, composição `PisaShort`, 1080x1920, 30 fps): 12,6 s na voz do narrador, 6 cenas.
- **A ponte** (`templates/bridge/`, composição `BridgeShort`): 67 s, o primeiro exemplo do estilo.
- Estudo do estilo: `references/` (STYLE_BIBLE.md, reports/*.md, frames/, sheets/).

As referências são material de estudo.
- Nunca publique nem envie os vídeos de referência.
- Nunca copie roteiro, bonecos ou cenas deles. História, bonecos e voz são sempre do usuário.
- Nunca diga o nome do canal de referência na narração ou na descrição.

Regras padrão (o usuário pode mudar):
- Sem legenda nem etiqueta dentro do desenho.
- Português do Brasil.
- Voz num tom só, firme e rápida.
- Piadas são fatos reais pesquisados.
- Mixagem: música +3 dB, efeitos -6 dB, voz intocada.
- Final vertical 2K: 1440x2560 (`--scale 1.3333`).
- Salvar depois de cada etapa.

## Instalação (primeira vez)
1. Copie esta pasta para `~/.claude/skills/desenho-animado/`.
2. Crie o projeto: copie `templates/projeto/` para uma pasta nova, depois `templates/pisa/` e `templates/bridge/` para
   `src/videos/pisa/` e `src/videos/bridge/` dela, e rode `npm install`.
3. Confira que o Node, o ffmpeg e o Google Chrome estão instalados.

## Passo a passo
1. **Tema e fatos.** Uma história verdadeira e surpreendente, com causa e efeito físicos (precisa ser visual), e uma
   comparação do dia a dia que explique.
   - Escreva os fatos com a fonte no topo de `SCRIPT.md`. Confira cada data e número antes de escrever.
2. **Roteiro** (~3,7 palavras/s). Fórmula das batidas:
   - **Gancho:** o fato absurdo numa frase ("A torre mais famosa da Itália só tá de pé porque uma guerra parou a obra.").
   - **Cenário:** ano, lugar, orgulho.
   - **Ação:** a coisa vai subindo em três ou quatro batidas, cada uma um pouco maior.
   - **O estalo:** o momento em que dá errado.
   - **Linha dupla seca:** "Por sorte… / Por azar…".
   - **Explicação:** uma ideia física através de uma comparação do dia a dia, começando com "Sabe por quê?".
   - **Consequência** e **virada final**.
   - Nunca descreva o que a pessoa já está vendo.
   - Curto também funciona: a Torre de Pisa tem 5 frases e 12,6 s.
3. **Voz.** Grave ou gere `voice.wav` e tire o tempo de cada palavra (`words.json`, qualquer transcrição com tempo por
   palavra). Corrija os tempos à mão. Tudo é sincronizado no words.json.
4. **Plano das cenas** em `story.ts`: copie `templates/pisa/` (ou `templates/bridge/`) para `src/videos/<nome>/`,
   registre a composição nova em `src/Root.tsx` e renomeie.
   - `TOTAL`: duração em quadros. Os tempos das palavras (`T_SINK`, `T_WAR`… na Pisa) ficam no topo.
   - `SHOTS`: id, quadros a/b, luz day/golden, modo da multidão.
   - `XFADE`: fusões nas trocas de lugar/tempo. `FLASH_AT`: um flash branco depois do gancho.
   - `CAMS`: chaves por cena `{f, dur?, cut?, s: f => {pos, look, fov, roll}}`.
   - `KICKS`: tremidas de impacto. `DOF`/`dofAt`: desfoque por batida. `FOREGROUND`: objetos em primeiro plano.
   - Toda reação visual cai 0-3 quadros antes da palavra dela.
5. **Mundo.**
   - `lights.ts`: luzes e paleta do céu/rio/nuvens por luz.
   - `shade.ts`: sombreado em dois tons e `untone()`.
   - `build.ts`: cidade, casas e objetos (kit Kenney CC0 opcional, recolorido), tirando tudo que bloqueia uma câmera.
   - `paint.ts`: texturas pintadas em Canvas2D, com as emendas pintadas como tons escuros.
   - `world.ts`: céu em shader, névoa = cor do horizonte, rio, pose por quadro, sol fixo por cena e relativo à câmera.
     Na Pisa, a torre é feita andar por andar (`FLOOR_H`, `poseTower`): ela afunda, inclina e fica curva (`CURVE`).
6. **Bonecos.**
   - `toon.ts`: a API de desenho `Pen` em Canvas2D, tela 600x1000, sola em y = 975, cabeça de feijão, braços de palito,
     contorno ameixa de espessura variável, biblioteca de rostos.
   - `cast.ts`: cartões virados pra câmera, multidões, cartões de efeito, piscadas, caminhada. Todos na camada `NOINK`.
     Na Pisa: turistas, pedreiros com martelo (assustam na palavra "afundar") e soldados marchando.
   - `cardshade.ts`: os cartões recebem a luz da cena, sem emissão.
7. **Acabamento** (`Pisa.tsx`/`Bridge.tsx` + `ink.ts` + `lensblur.ts` + `grade.ts`).
   - Ordem: contorno → lente pré → lente principal → bloom → tone map NEUTRAL → cor (MSAA 4).
   - Todo parâmetro em pixel escala com a altura de saída / 1920.
   - Use o `EffectComposer` do próprio `postprocessing` montado à mão (veja "Consertos"), nunca o `<EffectComposer>` do
     `@react-three/postprocessing`.
8. **Som** (`templates/audio/`: timeline.py, sfx_gen.py, sfx.py, music.py, instruments.py, dsp.py, mix.py).
   - Tabela de eventos → efeitos sintetizados + trilha original abaixando sob a voz.
   - Saída: mix.wav (48 kHz, duração exata), stems e cues.md.
   - Trave os tempos da imagem antes de fazer o som. Mudou o tempo depois, refaça o som.
9. **Conferência do visual.** `node scripts/bridge-stills.mjs out/<nome>/x_ 100,400 0.5` (use `COMP=<Composição>`).
   - Compare lado a lado com os quadros de referência: `python scripts/sbs_sheet.py out.jpg --ours ... --ref ...`.
   - Confira foto por foto: câmera dentro de parede, boneco cortado na borda, boneco sumido, cor errada.
10. **Render final.**
    - `npx remotion render src/index.ts <Comp> out/<nome>/video.mp4 --codec h264 --crf 16 --scale 1.3333 --gl=angle`
    - Junte o som com `-map 0:v:0 -map 1:a:0` (o Remotion grava uma faixa de áudio muda).
    - QA: `python scripts/short_qa.py final.mp4 out/<nome>/qa shots.json` procura quadro preto, branco, congelado e pulo,
      além do volume e das folhas.
11. **Entrega.** Mande o mp4 final e anote o que foi feito.

## Regras aprendidas com o usuário (vídeo de Lampião) — seguir sempre
- Corte cada cena ~2 frames antes do início da frase (detecte as pausas com `ffmpeg silencedetect`), e mostre na tela exatamente o que a frase diz (fala do rio → mostrar o rio com os personagens).
- Ações pontuais (tiro, queda, explosão) caem na palavra exata: meça as micro-pausas (`silencedetect d=0.06`) e ponha o evento no início da palavra, nunca depois. O som do efeito vai no mesmo instante.
- "Centralizar" = ninguém fora de cena e a câmera não corta ninguém; NÃO é aproximar. Enquadre o grupo inteiro (todos os personagens da cena), com o principal no meio. Em 9:16 a largura é estreita: afaste a câmera ou alinhe o grupo em profundidade.
- Personagens não somem e reaparecem: se o bando está no lugar, ele aparece também na tomada aérea/geral.
- Câmera sempre em movimento (orbita, acompanha quem anda, aproxima devagar); nunca cena parada, nunca cortar para a mesma cena.
- Quando a narração diz uma ação (ex.: "cercaram"), mostre a ação de fato (policiais vindo de todos os lados e fechando o círculo).
- Usuário usa só celular e pede economia: poucas prévias (folha de quadros soltos), um render final em blocos retomáveis (`projeto/scripts/render_chunks.sh` + `finalize.sh`), reaproveitar blocos que não mudaram, mensagens curtas.

## Animação dos personagens (estudo de referência — detalhes em references/estudo_animacao_shorts.md)
- A imagem muda a cada 0,5–2 s. Cada palavra-chave tem uma imagem própria: plano geral → médio → close de reação, e insertos de objetos.
- Corpo vivo o tempo todo: respiração, piscar a cada 2–4 s e cabeça mudando de ângulo. Poses assimétricas, com o peso numa perna.
- Toda ação tem antecipação (3–4 quadros), ação (1–2 quadros, o corpo todo dobra), impacto (faíscas, tremor de 3–6 quadros) e acompanhamento (6–10 quadros).
- O rosto muda a cada 0,5–1,5 s:
  - olhos em ponto, meia-lua, círculo de choque ou "><";
  - sobrancelhas fazem metade da emoção;
  - a boca alterna 3 formas a cada 2–3 quadros enquanto o personagem fala;
  - extras de emoção: gota de suor, veia e linhas de susto.
- Todos olham para quem fala ou para o objeto da ação. Os personagens se deslocam pelo cenário.
- Luz: sempre uma fonte visível (fogueira, tocha, lua ou janela). À noite, céu frio com chão quente. Fundo desfocado, bonecos nítidos.
- **Física (detalhes na seção 7 de references/estudo_animacao_shorts.md):**
  - golpe: antecipação de 8–10 quadros, tensão de 3–6, golpe de 2, impacto (flash, tremor, câmera aproximando), segurar 6–12 com mola amortecida e recuperação de 10–12;
  - faíscas e corpos arremessados seguem trajetória balística com gravidade de 9,8 m/s², quique pequeno e poeira;
  - ao correr, o tronco inclina para frente; ao andar, o corpo sobe e desce;
  - exemplo pronto em src/videos/samurai (função `samurai` em cast.ts).

## Consertos (o que deu errado no vídeo da Torre de Pisa e como resolver)
- **Vídeo todo em branco, só o céu.** Com React 19 + @react-three/fiber 9, o `<EffectComposer>` do
  `@react-three/postprocessing` 3.x não desenha nada. Diagnóstico: um cubo vermelho sem efeitos aparece, e a cidade
  aparece com `--props='{"nopost":true}'`. Conserto (já em `templates/pisa/Pisa.tsx` e `templates/bridge/Bridge.tsx`):
  montar o composer à mão com `new EffectComposer(gl, { multisampling: 4, frameBufferType: HalfFloatType })`,
  `RenderPass` + passes de contorno/lente/bloom/cor, e renderizar em `useFrame(..., 1)`. Também `alpha: false` no `gl`
  do ThreeCanvas.
- **Os bonecos sumiram.** Andar com a câmera em direção a um ponto distante faz ela passar dos bonecos da frente. Nas
  esperas, use zoom de lente (mexer no fov) em vez de andar com a câmera (`dolly()` em story.ts da Pisa) e deixe a câmera
  e a multidão mais para trás.
- **A torre não parecia torta.** A inclinação real (~4°) some no vídeo. Exagere de propósito, como desenho animado faz
  (4,8° no toco, 7° pronta).
- **Pé cortado embaixo.** Abaixe o ponto que a câmera olha (`look` y) até os pés entrarem no quadro.
- **Downloads bloqueados do kit Kenney.** O carregamento é opcional: sem ele, faça árvores simples em código.
- **Mac:** renderize com `TMPDIR=<pasta com espaço>`, o Chrome do sistema (`--browser-executable`) e `--gl=angle`.

## Valores do visual (todos em `templates/`)
Comece todo desenho novo de `templates/pisa/` ou `templates/bridge/`: o visual mora nestes valores e a história mora em
story.ts, no layout do build.ts/world.ts e nos papéis do cast.ts.
- **Luzes** (`lights.ts`, sol relativo à câmera e fixo por cena):
  - dia: az 75 / el 48, luz [1.58,1.5,1.33], sombra [.30,.29,.36], lift [.05,.06,.11] (tom frio SÓ na sombra), céu
    #3e7fd2 no alto → #b8d0ec no horizonte, névoa = horizonte, 25→300 m, uSat 1.08, ~15 % de névoa azul depois de 60 m.
  - golden: az 6 / el 7 (sol baixo de contraluz), luz pra #FFB36B ×1.5, sombra azul-violeta (fachada ≈ #444380), céu
    #ffc47c → #8a6f8a, névoa pêssego só depois de 50 m, disco do sol #ffcf9e + bloom.
- **Cores dos materiais** (`paint.ts`/`build.ts`): casas tijolo/creme/ocre/terracota apagados com rodapé, cornija,
  peitoris, chaminé; alturas 7 / 8,4 / 9,8 m; pedra cinza/bege quente (saturação −35 %); madeira ocre com emendas quase
  pretas; ferro escuro e dessaturado. Nunca amarelo-limão, nunca rosto lilás.
- **Contorno** (`ink.ts`): #030303, 5,1 px perto (6 m) → 3,3 px longe (90 m) em 1080x1920, dobras ×0,8 a partir de 35°,
  saltos de profundidade a partir de 1 %; os bonecos ficam na camada `NOINK` (têm o próprio contorno ameixa).
- **Lente** (`lensblur.ts` + `dofAt`): cInf em px a 1080: closes 12-16, planos médios 10-12, parque 7, golden 5,
  abertos/aéreos 0. Foco nos olhos da fileira da frente.
- **Acabamento:** bloom (thr 1.0, int .5, 6 níveis, raio .6) → tone map NEUTRAL → cor; MSAA 4. Granulação desligada.
- **Bonecos:** cabeça h/w .94, contorno ameixa #241726, olhos .26 W de distância, sem blush, 14 expressões; adultos com
  3,5 cabeças de altura; balanço da caminhada 5 %, inclinação 1-7°, passo de 0,8 m; piscadas a cada 0,5-2,3 s; sombra de
  contato ~.5 sob os pés.
- **Câmera:** corta nos saltos grandes, desliza 18-40 quadros (smootherstep), toda espera avança devagar (nenhuma parada
  ≥ 4 quadros), tremida que troca de lado a cada quadro e some em 7 quadros nos impactos, rolagens de 4-4,6°.

## Metas medidas na referência (detalhes em references/reports/)
- **Contorno:** ~3 px a 1080 de largura, quase preto #0b0a0c, quase constante com a distância. Só silhuetas, saltos de
  profundidade e dobras. Bonecos nunca recebem o contorno do mundo; o deles é ameixa #201628-#2f1d28.
- **Cor:** luminância mediana de dia ~.57, sem pretos esmagados (p5 ~.23), croma C* p90 ~55, céu #5e93d9.
  Golden: horizonte pêssego #ffd08a, sombras azul-violeta (nunca marrom), sol de contraluz.
- **Profundidade:** desfoque em ~1/3 do tempo (closes e planos médios), névoa = cor do horizonte, bloom só em emissivos.
- **Câmera:** cortes secos só nos saltos grandes; toda espera avança 0,15-0,35 %/quadro; sem câmera na mão.
- **Bonecos:** ~3,5 cabeças de altura, pernas 1,4 cabeça, braços finos, cabeça de feijão, rostos com brilho ~.93.

## Igualar o visual a uma referência (como chegar no "parece igual")
1. **Meça a referência primeiro.** Um relatório por tema (movimento, profundidade, textura, bonecos, luz, contorno, cor),
   com números e não adjetivos, em `references/reports/<tema>.md`.
2. **Uma cópia por dono.** Cada agente cuida dos próprios arquivos numa cópia do projeto (câmera: story.ts; mundo:
   world.ts/lights.ts/shade.ts/grade.ts; materiais: paint.ts/build.ts; bonecos: toon.ts/cast.ts/cardshade.ts; acabamento:
   ink.ts/Pisa.tsx/lensblur.ts). Quando usar vários agentes, divida os arquivos, não só as tarefas.
3. **Junte** com `python scripts/bridge_merge.py`, rode `npx tsc --noEmit` e sincronize todas as cópias.
4. **Confira** com um agente novo: folhas lado a lado, nota de 0 a 10 por área e uma lista numerada de correções.

## Armadilhas
- Materiais do kit Kenney vêm verde-azulados: recolora pelo nome do material.
- Câmera dentro de casa: o filtro de linha de visão remove o que bloqueia a câmera.
- Contorno na mesma passada do desfoque é apagado: o contorno é uma passada própria, antes do desfoque.
- Parâmetros em pixel escalam com a resolução (fotos a 0,5, final a 1,333).
- **Disco:** cada render copia `public/` para a pasta temporária e não apaga. Use `TMPDIR`/`REMOTION_TMP` numa pasta com
  espaço e apague as pastas `remotion-webpack-bundle-*` antigas quando nada estiver renderizando.
- O Remotion grava áudio mudo: junte com `-map 0:v:0 -map 1:a:0`.
- Arquivos `.ts` de rascunho dentro de `out/` quebram o `tsc`: use `.txt`.
- Granulação deixa o arquivo 4x maior e vira borrão no YouTube. Deixe desligada.
- Balanço desenhado com uma corda só parece enforcamento: sempre duas cordas.
- Objeto a menos de ~2 m da lente vira mancha gigante cortada na borda.
- Placa pintada com sol de lado fica cinza e ilegível: use material sem luz na face da placa.
- Espera parada lê como congelada: toda espera precisa de um zoom lento.

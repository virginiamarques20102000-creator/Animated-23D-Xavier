# História do Brasil: short de 40 s (prévia)

Vídeo vertical 1080x1920, 30 fps, feito em Remotion. Pinturas em domínio público do Wikimedia Commons,
com câmera em movimento, giro 3D, transições, anos e legendas animados, linha do tempo e bandeira tremulando.
Sai sem áudio, para a narração do ElevenLabs entrar depois. Há uma trilha opcional feita por código, em `audio/music.py`.

## Como montar
1. `npm i` (mais `@remotion/cli@4.0.543 @remotion/renderer@4.0.543 @remotion/bundler@4.0.543`)
2. Baixe as imagens que faltam: `python3 dl.py jobs.txt` (a Wikimedia limita a ~1 download a cada 10 min)
3. Edite os planos e textos em `edit.json` e gere `src/scenes.ts` e `public/img/` com `mkscenes.py`.
   Os caminhos do script assumem `img/` e `app/` lado a lado.
4. `npx remotion render src/index.ts Brasil out.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell`

## Créditos e licenças (todas em domínio público, no Wikimedia Commons)
- Oscar Pereira da Silva, *Desembarque de Pedro Álvares Cabral em Porto Seguro* (1900)
- Victor Meirelles, *Primeira Missa no Brasil* (1860)
- Frans Post, *Engenho* (séc. XVII)
- Jean-Baptiste Debret, cenas da escravidão no Brasil (1834-39)
- Pedro Américo, *Independência ou Morte* (1888)
- Benedito Calixto, *Proclamação da República* (1893)
- Atribuída a Nicolas-Louis-Albert Delerive, *Embarque da Família Real para o Brasil*
- Fonte Cinzel (SIL Open Font License)

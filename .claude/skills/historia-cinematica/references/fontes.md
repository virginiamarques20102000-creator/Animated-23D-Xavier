# Fontes de imagens e vídeos gratuitos (sem risco de strike)

## O que é seguro
| Fonte | O que tem | Licença | Precisa de chave? | Como baixar aqui |
|---|---|---|---|---|
| **Wikimedia Commons** | Pinturas históricas, fotos antigas, alguns vídeos | Domínio público / CC0 (filtre) | Não | `scripts/baixar_commons.py` (respeita o limite) |
| **Pexels** | Clipes verticais modernos (mar, mata, cavalos, cidades, fogo) | Pexels License: uso livre, sem crédito | **Sim** (grátis, pexels.com/api/new) | `scripts/baixar_pexels.py` |
| **Pixabay** | Clipes e fotos | Pixabay License: uso livre | **Sim** (chave vai na URL) | API; o site bloqueia robôs (Cloudflare) |
| **NASA** (images.nasa.gov) | Terra vista do espaço, Brasil de cima | Domínio público | Não | host `images-api.nasa.gov` + `images-assets.nasa.gov` |
| **Internet Archive** (Prelinger) | Filmes antigos (início do séc. XX) | Domínio público (confira cada item) | Não | host `archive.org` (redireciona para `iaNNN.us.archive.org`) |
| **Mixkit** | Clipes de banco | Mixkit License: uso livre | Não (sem API) | host `assets.mixkit.co` |

Cada host novo precisa estar liberado na rede do ambiente; peça a liberação ao usuário uma vez, com o motivo.
Se ele negar, não insista: siga com o que já está liberado e com cenas feitas por código.

## Regras de ouro
- **Domínio público primeiro** para tudo que é histórico. Pinturas brasileiras do séc. XIX (Pedro Américo, Victor
  Meirelles, Oscar Pereira da Silva, Benedito Calixto, Debret, Frans Post, Rugendas) são domínio público.
- No Commons, use **só** `Public domain` ou `CC0`. CC BY/BY-SA exigem crédito e "compartilha igual"; evite em vídeo.
- **Nunca**: trechos de filmes, novelas, documentários de TV, vídeos "sem copyright" reenviados no YouTube,
  sites com licenças misturadas (Videvo: parte é "editorial only").
- **Guarde a origem de cada arquivo** (os scripts gravam `creditos.json` / `creditos_pexels.json`). Strike vem de
  pedido de remoção, quase nunca de banco livre; o que às vezes aparece é **reivindicação de Content ID por engano**
  (alguém subiu o clipe como seu). Contesta-se com o link da licença.
- Não existe filmagem do Brasil antes de ~1890: clipes reais entram como **apoio visual** (mar, mata, cavalos,
  fogo, mapas, cidade atual), intercalados com pinturas e 3D.

## Wikimedia: o limite
Em IP de nuvem a Wikimedia devolve `429` com `Retry-After: 600` e pode manter o bloqueio por horas. Por isso:
1. Baixe as pinturas **logo no começo**, em segundo plano, e monte o resto enquanto isso.
2. Cada arquivo: `upload.wikimedia.org/wikipedia/commons/<h0>/<h0h1>/<Nome>` (h = md5 do nome com `_`),
   miniatura padrão `/thumb/.../3840px-<Nome>` ou `1920px-` (larguras fora do padrão dão 400).
3. Se não chegar, **não trave o vídeo**: substitua o plano por cena 3D ou motion graphics (`mg`) e avise o usuário.

## Ideias de clipes (busca em inglês na Pexels)
mar/caravelas: `ocean waves sailing ship`, `stormy sea` · chegada: `tropical beach aerial` · mata: `rainforest drone`
engenho: `sugar cane field` · ouro: `gold nuggets` · escravidão: `chains dark` · corte: `old ship storm`
independência: `horses galloping`, `horse running dust` · festa: `crowd celebration` · hoje: `rio de janeiro aerial`

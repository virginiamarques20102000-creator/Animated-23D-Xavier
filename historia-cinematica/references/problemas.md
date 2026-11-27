# Problemas conhecidos e consertos

| Sintoma | Causa | Conserto |
|---|---|---|
| `Timeout ... Fetching Cinzel font` | o navegador do render não passa pelo proxy | fonte local em `public/fonts` + `src/font.ts` (FontFace + delayRender); não use `@remotion/google-fonts` |
| `remotion browser ensure` falha (`remotion.media`) | download bloqueado | `--browser-executable=/opt/pw-browsers/chromium_headless_shell` |
| Tudo branco/estourado no 3D | exposição do `Sky` | `gl.toneMappingExposure` 0,3; sem `ToneMappingEffect` |
| Quadro 3D preto ou mar espelhado | textura da água carregou depois | `delayRender` + `advance()` antes do `continueRender` (ver 3d.md) |
| Wikimedia `429 Retry-After: 600` | limite por IP | esperar exatamente o pedido; baixar cedo, em 2º plano; plano B com 3D/`mg` |
| Pixabay devolve "Just a moment..." (403) | Cloudflare | só pela API com chave |
| Pexels `401` | sem chave | Network secret no ambiente (host `api.pexels.com`, header `Authorization`, valor = chave pura); sessão nova lê com certeza |
| Acento "Ô" cortado no ano/título | `background-clip:text` com `lineHeight:1` | `lineHeight:1.25` + `paddingTop:20` |
| Palavra grande sai da tela (ex. INDEPENDÊNCIA) | 118 px numa tela de 1080 | ≤ 100 px para 13 letras em Cinzel 900 |
| `__pycache__` no repositório (hook pede commit) | importar módulos Python do projeto | `sys.dont_write_bytecode=True`; apagar a pasta, não commitar |
| Render 2D de 49 s | — | ~8 min a 1080×1920; comprimir com `render.sh` (90 MB → ~35 MB) |

Arquivos grandes de saída e downloads ficam fora do repositório (scratchpad); no repositório só código, roteiro e créditos.

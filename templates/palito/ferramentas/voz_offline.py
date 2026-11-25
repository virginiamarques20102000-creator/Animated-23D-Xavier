#!/usr/bin/env python3
"""Voz de teste sem internet (espeak-ng), com o tempo de cada palavra, no mesmo formato do voz.py.

Uso:
  python3 voz_offline.py roteiro.txt --saida voz [--velocidade 170] [--pausa 0.28]

Serve para testar o vídeo quando não há ElevenLabs nem Whisper (rede bloqueada, sem chave):
a voz é robótica, mas os tempos batem com o áudio, então a cena inteira já sincroniza.
Depois é só trocar pela voz de verdade (voz.py ou gravada + transcrever.py) e rodar o montar.py de novo.

Cada frase vira um áudio; o tempo de cada palavra é repartido pelas sílabas dentro do trecho com voz
da frase (a mesma ideia do alinhamento do vídeo das trincheiras). Precisa do espeak-ng
(apt-get install espeak-ng / brew install espeak-ng), ffmpeg e numpy.
Escreve voz/voz.wav e voz/tempos.json ({"duracao", "frases": [{"texto", "s", "e", "palavras": [{"w", "s", "e"}]}]}).
"""
import argparse, json, re, subprocess, tempfile, wave
from pathlib import Path
import numpy as np

SR = 48000
EXTENSO = {"0": 2, "1": 2, "2": 1, "3": 1, "4": 2, "5": 2, "6": 1, "7": 2, "8": 2, "9": 2}


def silabas(w):
    if re.fullmatch(r"\d+", w):              # "1952" = mil novecentos e cinquenta e dois: ~ 3 sílabas por dígito
        return max(2, 3 * len(w))
    n = len(re.findall(r"[aeiouáéíóúâêôãõà]+", w.lower()))
    return max(1, n)


def ler(wav):
    with wave.open(str(wav)) as f:
        return np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("roteiro")
    ap.add_argument("--saida", default="voz")
    ap.add_argument("--voz", default="pt-br")
    ap.add_argument("--velocidade", type=int, default=170)
    ap.add_argument("--pausa", type=float, default=0.28)
    ap.add_argument("--inicio", type=float, default=0.25)
    a = ap.parse_args()
    frases = [l.strip() for l in Path(a.roteiro).read_text().splitlines() if l.strip()]
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    pedacos, out, t = [np.zeros(int(a.inicio * SR), np.float32)], [], a.inicio
    with tempfile.TemporaryDirectory() as tmp:
        for i, fr in enumerate(frases):
            bruto, wav = Path(tmp) / f"{i}.wav", Path(tmp) / f"{i}_48.wav"
            subprocess.run(["espeak-ng", "-v", a.voz, "-s", str(a.velocidade), "-w", str(bruto), fr], check=True)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(bruto), "-ar", str(SR), "-ac", "1", str(wav)], check=True)
            x = ler(wav)
            # corta o silêncio das pontas: o trecho com voz é onde a energia passa de -40 dB
            jan = int(0.01 * SR)
            en = np.array([np.sqrt(np.mean(x[k:k + jan] ** 2) + 1e-12) for k in range(0, len(x), jan)])
            voz = np.where(20 * np.log10(en) > -40)[0]
            a0, a1 = (voz[0] * jan, min(len(x), (voz[-1] + 1) * jan)) if len(voz) else (0, len(x))
            x = x[a0:a1]
            dur = len(x) / SR
            ws = fr.split()
            pesos = np.array([silabas(re.sub(r"[^\wÀ-ú]", "", w) or w) + 0.35 for w in ws], float)
            cort = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * dur
            palavras = [{"w": w, "s": round(t + cort[j], 3), "e": round(t + cort[j + 1] - 0.02, 3)} for j, w in enumerate(ws)]
            out.append({"texto": fr, "s": palavras[0]["s"], "e": palavras[-1]["e"], "palavras": palavras})
            pedacos += [x, np.zeros(int(a.pausa * SR), np.float32)]
            t += dur + a.pausa
    audio = np.concatenate(pedacos + [np.zeros(int(0.6 * SR), np.float32)])
    audio = audio / max(1e-6, np.abs(audio).max()) * 0.89
    with wave.open(str(saida / "voz.wav"), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((audio * 32767).astype(np.int16).tobytes())
    dur = round(len(audio) / SR, 2)
    (saida / "tempos.json").write_text(json.dumps({"duracao": dur, "frases": out}, ensure_ascii=False, indent=1))
    print(f"voz de teste pronta: {dur:.1f} s, {sum(len(f['palavras']) for f in out)} palavras, em {saida}/")


main()

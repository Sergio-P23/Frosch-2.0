"""Regenerate the original arcade cues used by the bolirana UI.

Requires numpy. Writes PCM WAV files that can be encoded to Ogg Vorbis for NW.js.
"""

from pathlib import Path
import wave

import numpy as np


SR = 44100
OUT = Path(__file__).resolve().parents[1] / "assets" / "sounds"
RNG = np.random.default_rng(42)


def canvas(seconds):
    return np.zeros(int(SR * seconds), dtype=np.float64)


def add_tone(track, start, duration, freq, amp=0.1, decay=4, shimmer=False):
    pos = int(start * SR)
    n = min(int(duration * SR), len(track) - pos)
    if n <= 0:
        return
    t = np.arange(n) / SR
    envelope = np.minimum(1, t / 0.012) * np.exp(-decay * t)
    tone = np.sin(2 * np.pi * freq * t)
    if shimmer:
        tone += 0.32 * np.sin(2 * np.pi * freq * 2.01 * t)
        tone += 0.16 * np.sin(2 * np.pi * freq * 3.02 * t)
    track[pos:pos + n] += amp * envelope * tone


def add_tick(track, start, amp=0.13):
    pos = int(start * SR)
    n = min(int(.055 * SR), len(track) - pos)
    if n <= 0:
        return
    t = np.arange(n) / SR
    click = (RNG.normal(0, 1, n) * .35 + np.sin(2 * np.pi * 1250 * t))
    track[pos:pos + n] += amp * np.exp(-85 * t) * click


def write(name, track):
    peak = np.max(np.abs(track))
    if peak > .88:
        track *= .88 / peak
    pcm = np.int16(np.clip(track, -1, 1) * 32767)
    with wave.open(str(OUT / name), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SR)
        wav.writeframes(pcm.tobytes())


spin = canvas(1.55)
t = np.arange(len(spin)) / SR
phase = 2 * np.pi * (250 * t + 330 * t * t)
spin += .045 * np.sin(phase) * np.sin(np.pi * np.minimum(t / 1.55, 1)) ** .7
for when in [.08, .16, .25, .35, .46, .59, .73, .9, 1.09, 1.31]:
    add_tick(spin, when, .1 + when * .035)
write("ruleta-giro.wav", spin)

prize = canvas(1.55)
for start, frequency in [(0, 783.99), (.14, 987.77), (.29, 1174.66), (.45, 1567.98)]:
    add_tone(prize, start, 1.05, frequency, .13, 3.1, True)
add_tone(prize, .48, .9, 392, .075, 2.7, True)
write("ruleta-premio.wav", prize)

victory = canvas(4.25)
for start, frequency in [(.0, 523.25), (.18, 659.25), (.36, 783.99), (.56, 1046.5),
                         (1.2, 659.25), (1.39, 783.99), (1.58, 1046.5), (1.82, 1318.51),
                         (2.55, 783.99), (2.76, 1046.5), (2.98, 1318.51)]:
    add_tone(victory, start, 1.15, frequency, .075, 2.5, True)
for when in [0, .58, 1.18, 1.78, 2.38, 2.98, 3.55]:
    add_tick(victory, when, .075)
write("victoria-fiesta.wav", victory)

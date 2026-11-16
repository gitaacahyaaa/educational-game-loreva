// Efek suara 8-bit dibuat langsung dengan WebAudio (tanpa file audio)
LV.Audio = (() => {
    let ctx = null, muted = !!LV.Storage.settings().muted;

    function unlock() {
        if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }
    function tone(freq, dur, type = 'square', vol = .06, delay = 0, slide = 0) {
        if (muted || !ctx) return;
        const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(freq, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + .03);
    }
    const FX = {
        correct: () => { tone(523, .1, 'square', .06, 0); tone(659, .1, 'square', .06, .09); tone(784, .2, 'square', .06, .18); },
        wrong: () => { tone(220, .25, 'sawtooth', .07, 0, -120); tone(165, .3, 'sawtooth', .07, .16, -80); },
        coin: () => { tone(988, .07, 'square', .05); tone(1319, .15, 'square', .05, .07); },
        open: () => tone(180, .4, 'triangle', .09, 0, 420),
        win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, .2, 'square', .06, i * .13)),
        click: () => tone(440, .05, 'square', .04)
    };
    return {
        unlock,
        play(n) { unlock(); if (FX[n]) FX[n](); },
        toggle() { muted = !muted; LV.Storage.setSetting('muted', muted); return muted; },
        isMuted: () => muted
    };
})();
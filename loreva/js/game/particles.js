LV.FX = (() => {
    const ps = [], tx = [];
    let shk = 0, fl = null;
    return {
        burst(x, y, color, n = 14, spd = 90, grav = 140, size = 3) {
            for (let i = 0; i < n; i++) {
                const a = Math.random() * Math.PI * 2, s = spd * (.4 + Math.random() * .8);
                ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: 0, max: .5 + Math.random() * .5, color, size, grav });
            }
        },
        stars(x, y) { this.burst(x, y, '#ffd84a', 16, 110, 60, 4); this.burst(x, y, '#fff7b0', 8, 70, 40, 2); },
        text(x, y, str, color = '#fff') { tx.push({ x, y, str, color, life: 0, max: 1.2 }); },
        shake(v = .35) { shk = Math.max(shk, v); },
        flash(color, a = .4) { fl = { color, a }; },
        offset() { return shk > 0 ? [(Math.random() - .5) * shk * 22, (Math.random() - .5) * shk * 22] : [0, 0]; },
        update(dt) {
            shk = Math.max(0, shk - dt);
            if (fl) { fl.a -= dt * 1.2; if (fl.a <= 0) fl = null; }
            for (let i = ps.length - 1; i >= 0; i--) {
                const p = ps[i]; p.life += dt;
                if (p.life >= p.max) { ps.splice(i, 1); continue; }
                p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
            }
            for (let i = tx.length - 1; i >= 0; i--) { const q = tx[i]; q.life += dt; q.y -= 22 * dt; if (q.life >= q.max) tx.splice(i, 1); }
        },
        draw(g) {
            ps.forEach(p => { g.globalAlpha = 1 - p.life / p.max; g.fillStyle = p.color; g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); });
            g.font = '10px "Press Start 2P", monospace'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#000';
            tx.forEach(q => { g.globalAlpha = Math.min(1, (q.max - q.life) * 2); g.strokeText(q.str, q.x, q.y); g.fillStyle = q.color; g.fillText(q.str, q.x, q.y); });
            g.globalAlpha = 1;
        },
        overlay(g, w, h) { if (fl) { g.globalAlpha = Math.max(0, fl.a); g.fillStyle = fl.color; g.fillRect(0, 0, w, h); g.globalAlpha = 1; } }
    };
})();
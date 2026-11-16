LV.Renderer = (() => {
    const T = 32;
    const TH = {
        forest: {
            g: ['#4caf50', '#45a549'], tuft: '#2e7d32', fl: ['#ffeb3b', '#ff80ab', '#ffffff'],
            path: ['#c9a46a', '#bd9760'], pebble: '#8d6e43', water: ['#2b78d4', '#3d90ee'],
            wallC: ['#1f6b2a', '#2f8f3a', '#58c05a'], trunk: '#6d4326'
        }
    };

    function tile(g, ch, tx, ty, t, th) {
        const x = tx * T, y = ty * T, h = LV.U.hash(tx, ty), h2 = LV.U.hash(ty + 5, tx + 9);
        if (ch === '~') {
            g.fillStyle = th.water[(tx + ty) & 1]; g.fillRect(x, y, T, T);
            const o = (Math.sin(t * 2 + tx * 1.3 + ty) * 6) | 0;
            g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 10 + o, y + 8, 10, 2); g.fillRect(x + 10 - o, y + 20, 8, 2);
            return;
        }
        if (ch === '=') {
            g.fillStyle = th.path[(tx + ty) & 1]; g.fillRect(x, y, T, T);
            g.fillStyle = th.pebble;
            g.fillRect(x + 3 + ((h * 22) | 0), y + 3 + ((h2 * 22) | 0), 4, 3);
            g.fillRect(x + 16 + ((h2 * 10) | 0), y + 18 + ((h * 8) | 0), 3, 2);
            return;
        }
        g.fillStyle = th.g[(tx + ty) & 1]; g.fillRect(x, y, T, T);
        if (ch === '#') {
            g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 4, y + 26, 26, 5);
            g.fillStyle = th.trunk; g.fillRect(x + 13, y + 20, 7, 11);
            g.fillStyle = th.wallC[0]; g.fillRect(x + 6, y + 1, 20, 2); g.fillRect(x + 3, y + 3, 26, 19); g.fillRect(x + 5, y + 22, 22, 2);
            g.fillStyle = th.wallC[1]; g.fillRect(x + 6, y + 4, 20, 14);
            g.fillStyle = th.wallC[2]; g.fillRect(x + 7 + ((h * 6) | 0), y + 5, 8, 4); g.fillRect(x + 18, y + 10, 5, 3);
        } else if (ch === ',') {
            [[x + 5 + ((h * 14) | 0), y + 6 + ((h2 * 14) | 0)], [x + 18 + ((h2 * 8) | 0), y + 17 + ((h * 9) | 0)]].forEach((p, i) => {
                g.fillStyle = th.fl[(((h * 7) | 0) + i) % 3]; g.fillRect(p[0], p[1] + 2, 6, 2); g.fillRect(p[0] + 2, p[1], 2, 6);
                g.fillStyle = '#fff59d'; g.fillRect(p[0] + 2, p[1] + 2, 2, 2);
            });
        } else {
            g.fillStyle = th.tuft;
            [[x + 4 + ((h * 20) | 0), y + 5 + ((h2 * 18) | 0)], [x + 17 + ((h2 * 10) | 0), y + 18 + ((h * 9) | 0)]].forEach(p => {
                g.fillRect(p[0], p[1], 2, 4); g.fillRect(p[0] + 3, p[1] + 1, 2, 3);
            });
        }
    }

    return {
        T,
        drawMap(g, map, t, theme) {
            const th = TH[theme] || TH.forest;
            for (let y = 0; y < map.length; y++) for (let x = 0; x < map[y].length; x++) tile(g, map[y][x], x, y, t, th);
        },
        gate(g, x, y, open, t) {
            g.fillStyle = '#3a3350'; g.fillRect(x, y, T, T);
            g.fillStyle = '#6a6288'; g.fillRect(x + 2, y, 28, 4);
            g.fillStyle = '#0d0a16'; g.fillRect(x + 4, y + 3, 24, 29);
            g.save(); g.beginPath(); g.rect(x + 4, y + 3, 24, 29); g.clip();
            const k = open * 12;
            g.fillStyle = '#8b83a8'; g.fillRect(x + 4 - k, y + 3, 12, 29); g.fillRect(x + 16 + k, y + 3, 12, 29);
            g.fillStyle = '#a79fc4'; g.fillRect(x + 5 - k, y + 4, 2, 27); g.fillRect(x + 17 + k, y + 4, 2, 27);
            g.fillStyle = '#4a4466'; g.fillRect(x + 8 - k, y + 8, 3, 3); g.fillRect(x + 8 - k, y + 24, 3, 3); g.fillRect(x + 21 + k, y + 8, 3, 3); g.fillRect(x + 21 + k, y + 24, 3, 3);
            if (open < 1) {
                const p = .5 + .5 * Math.sin(t * 4);
                g.fillStyle = `rgba(120,220,255,${(.45 + .45 * p) * (1 - open)})`;
                g.fillRect(x + 14, y + 13, 4, 10); g.fillRect(x + 11, y + 16, 10, 4);
            }
            g.restore();
        },
        pad(g, x, y, done, t) {
            g.fillStyle = '#8f8aa5'; g.fillRect(x + 3, y + 3, 26, 26);
            g.fillStyle = '#6f6a88'; g.fillRect(x + 6, y + 6, 20, 20);
            const p = .5 + .5 * Math.sin(t * 3);
            g.fillStyle = done ? 'rgba(125,255,154,.9)' : `rgba(120,200,255,${.55 + .45 * p})`;
            g.fillRect(x + 14, y + 8, 4, 16); g.fillRect(x + 8, y + 14, 16, 4);
            g.fillStyle = done ? 'rgba(125,255,154,.25)' : `rgba(120,200,255,${.12 + .15 * p})`;
            g.fillRect(x + 1, y + 1, 30, 30);
        }
    };
})();
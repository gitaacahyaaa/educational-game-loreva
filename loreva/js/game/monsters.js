LV.Monsters = {
    types: {
        slime: { name: 'Slime Hutan', sprite: 'slime', scale: 2, hp: 2, dmg: 1, coins: 6, size: 96 },
        mushroom: { name: 'Jamur Beracun', sprite: 'mushroom', scale: 2, hp: 2, dmg: 1, coins: 7, size: 96 },
        treant: { name: 'Treant Penjaga Hutan', sprite: 'treant', scale: 4, hp: 3, dmg: 2, coins: 25, size: 150, boss: true }
    },
    create(kind, tx, ty, key) {
        const d = this.types[kind];
        return { type: d.boss ? 'boss' : 'monster', kind, key, x: tx * 32, y: ty * 32, hp: d.hp, maxHp: d.hp, alive: true, t: Math.random() * 6 };
    },
    draw(g, m, t) {
        const d = this.types[m.kind], s = LV.Sprites.sprite(d.sprite, d.scale), size = 16 * d.scale;
        const bob = d.boss ? Math.sin(t * 1.5 + m.t) * 2 : Math.abs(Math.sin(t * 3 + m.t)) * 4;
        const cx = m.x + 16, base = m.y + 30;
        g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cx, base, size * .32, 4, 0, 0, Math.PI * 2); g.fill();
        g.drawImage(s, Math.round(cx - size / 2), Math.round(base - size - bob + (d.boss ? 4 : 2)));
        if (m.hp < m.maxHp) {
            const w = d.boss ? 40 : 24, y = base - size - 6;
            g.fillStyle = '#000'; g.fillRect(cx - w / 2 - 1, y - 1, w + 2, 6);
            g.fillStyle = '#ff5a6a'; g.fillRect(cx - w / 2, y, w * m.hp / m.maxHp, 4);
        }
    }
};
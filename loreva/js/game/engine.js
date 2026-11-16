LV.Engine = (() => {
    const C = LV.CONFIG, T = C.TILE;
    const $ = id => document.getElementById(id);
    let g, map = [], ents = [], level = null, mode = 'menu', busy = false;
    let t = 0, last = 0, prompt = null, promptTxt = '', flies = [], vignette = null, hudT = 0;
    let startPos = { x: 2, y: 12 };

    /* ---------- setup ---------- */
    function fit() {
        const stage = $('stage'), w = Math.min(innerWidth, innerHeight * C.W / C.H);
        stage.style.width = w + 'px'; stage.style.height = (w * C.H / C.W) + 'px';
        stage.style.setProperty('--u', (w / C.W).toFixed(3));
    }
    function makeVignette() {
        const c = document.createElement('canvas'); c.width = C.W; c.height = C.H;
        const v = c.getContext('2d'), gr = v.createRadialGradient(C.W / 2, C.H / 2, C.H * .35, C.W / 2, C.H / 2, C.W * .62);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(5,0,20,.55)');
        v.fillStyle = gr; v.fillRect(0, 0, C.W, C.H); return c;
    }
    function init() {
        g = $('game').getContext('2d'); g.imageSmoothingEnabled = false;
        vignette = makeVignette(); fit(); addEventListener('resize', fit);
        requestAnimationFrame(loop);
    }

    /* ---------- level ---------- */
    function loadLevel(n, applySaved) {
        level = LV.Levels[n]; ents = []; map = [];
        const S = LV.State, mons = level.monsters || ['slime']; let mi = 0;
        level.map.forEach((row, y) => {
            const r = row.padEnd(C.COLS, '#').slice(0, C.COLS).split('');
            r.forEach((ch, x) => {
                const key = `L${n}:${ch}${x}_${y}`;
                if (ch === 'P') startPos = { x, y };
                else if (ch === 'M') ents.push(LV.Monsters.create(mons[mi++ % mons.length], x, y, key));
                else if (ch === 'B') ents.push(LV.Monsters.create(level.boss, x, y, key));
                else if (ch === 'C') ents.push({ type: 'chest', key, x: x * T, y: y * T, open: false });
                else if (ch === 'Z') ents.push({ type: 'puzzle', key, x: x * T, y: y * T, done: false });
                else if (ch === 'D') ents.push({ type: 'gate', key, x: x * T, y: y * T, open: 0, opening: false });
                if ('PMBCZ'.includes(ch)) r[x] = '.'; else if (ch === 'D') r[x] = '=';
            });
            map.push(r);
        });
        while (map.length < C.ROWS) map.push(new Array(C.COLS).fill('#'));
        if (applySaved) {
            ents.forEach(e => {
                if (!S.done[e.key]) return;
                if (e.type === 'monster' || e.type === 'boss') e.alive = false;
                else if (e.type === 'chest') e.open = true;
                else if (e.type === 'puzzle') e.done = true;
                else if (e.type === 'gate') e.open = 1;
            });
        }
        flies = Array.from({ length: 16 }, () => ({ x: Math.random() * C.W, y: Math.random() * C.H, ph: Math.random() * 6, sp: 8 + Math.random() * 14, a: Math.random() * 6.28 }));
    }

    function blocked(x, y, w, h) {
        const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 1) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 1) / T);
        for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
            const c = (map[ty] || [])[tx];
            if (c === undefined || c === '#' || c === '~') return true;
        }
        for (const e of ents) {
            if ((e.type === 'gate' && e.open < 1) || e.type === 'chest') {
                if (x < e.x + T && x + w > e.x && y < e.y + T && y + h > e.y) return true;
            }
        }
        return false;
    }

    const doneCount = () => ents.filter(e => e.type === 'gate' ? e.open >= 1 : e.type === 'chest' ? e.open : e.type === 'puzzle' ? e.done : !e.alive).length;
    const totalCount = () => ents.length;

    function setPrompt(e) {
        prompt = e; let txt = '';
        if (e) {
            const key = matchMedia('(pointer:coarse)').matches ? '⚔' : 'SPASI';
            txt = `<b>[${key}]</b> ` + { gate: 'Buka Gerbang', chest: 'Buka Peti', puzzle: 'Pecahkan Rune' }[e.type];
        }
        if (txt !== promptTxt) { promptTxt = txt; $('prompt').innerHTML = txt; $('prompt').classList.toggle('hidden', !txt); }
    }

    /* ---------- alur permainan ---------- */
    async function start() {
        const S = LV.State, pack = LV.Questions.get(S.packId);
        LV.Quiz.init(pack);
        loadLevel(S.level, true);
        LV.Player.reset(startPos.x, startPos.y);
        mode = 'play'; busy = true; LV.Input.enabled = false; LV.Input.reset();
        $('hud').classList.remove('hidden'); $('touch').classList.add('on');
        LV.UI.hideAll(); LV.HUD.update(); LV.Progress.save();
        await LV.HUD.banner(`LEVEL ${S.level}`, `${level.name} — ${level.intro || ''}`);
        busy = false; LV.Input.enabled = true;
    }

    function toMenu() {
        mode = 'menu'; busy = false; LV.Input.enabled = false; LV.Input.reset(); setPrompt(null);
        $('hud').classList.add('hidden'); $('touch').classList.remove('on');
        loadLevel(1, false); LV.UI.showMenu();
    }

    function preview() { loadLevel(1, false); }

    async function run(e) {
        busy = true; LV.Input.enabled = false; LV.Input.reset(); setPrompt(null);
        try {
            if (e.type === 'gate') await LV.Challenges.gate(e);
            else if (e.type === 'chest') await LV.Challenges.chest(e);
            else if (e.type === 'puzzle') await LV.Challenges.puzzle(e);
            else if (e.type === 'monster') await LV.Challenges.battle(e, false);
            else if (e.type === 'boss') await LV.Challenges.boss(e);
        } catch (err) { console.error(err); }
        if (LV.State.hp <= 0) await defeat();
        LV.Progress.save(); LV.HUD.update();
        if (e.type === 'boss' && !e.alive) { await finishLevel(); return; }
        busy = false;
        setTimeout(() => { if (mode === 'play' && !busy) { LV.Input.reset(); LV.Input.enabled = true; } }, 150);
    }

    async function defeat() {
        const S = LV.State;
        await LV.HUD.banner('KAMU PINGSAN!', 'Kamu terbangun di titik awal, kehilangan sebagian koin...');
        S.coins = Math.floor(S.coins * .7); S.hp = Math.max(2, Math.ceil(S.maxHp / 2));
        LV.Player.reset(startPos.x, startPos.y);
    }

    async function finishLevel() {
        const S = LV.State, pack = LV.Questions.get(S.packId);
        if (!S.levelsDone.includes(S.level)) S.levelsDone.push(S.level);
        const c = S.addCoins(25);
        S.rewards.push(`Lencana ${level.name} (+${c} koin)`);
        LV.Audio.play('win'); LV.FX.stars(LV.Player.cx(), LV.Player.cy());
        await LV.HUD.banner('LEVEL SELESAI!', level.name);
        const hasNext = S.level < (pack.levels || 5) && LV.Levels[S.level + 1];
        if (hasNext) {
            S.level++; S.heal(2);
            loadLevel(S.level, true); LV.Player.reset(startPos.x, startPos.y);
            LV.Progress.save(); LV.HUD.update();
            await LV.HUD.banner(`LEVEL ${S.level}`, `${level.name} — ${level.intro || ''}`);
            busy = false; LV.Input.reset(); LV.Input.enabled = true;
        } else {
            mode = 'menu'; LV.Progress.clear();
            $('hud').classList.add('hidden'); $('touch').classList.remove('on');
            LV.UI.showResult();
        }
    }

    function usePotion() {
        const S = LV.State, P = LV.Player;
        if (mode !== 'play' || busy) return;
        if (S.potions <= 0) return LV.HUD.toast('Kamu tidak punya ramuan!');
        if (S.hp >= S.maxHp) return LV.HUD.toast('HP sudah penuh.');
        S.potions--; S.heal(2); LV.Audio.play('coin');
        LV.FX.burst(P.cx(), P.cy(), '#ff7ab8', 14, 70, -40, 3); LV.FX.text(P.cx(), P.y - 6, '+2 HP', '#ff9ad0');
        LV.Progress.save(); LV.HUD.update();
    }

    /* ---------- loop ---------- */
    function update(dt) {
        t += dt; LV.FX.update(dt);
        flies.forEach(f => {
            f.a += dt * (Math.random() - .5) * 4; f.x += Math.cos(f.a) * f.sp * dt; f.y += Math.sin(f.a) * f.sp * dt;
            if (f.x < 0) f.x = C.W; if (f.x > C.W) f.x = 0; if (f.y < 0) f.y = C.H; if (f.y > C.H) f.y = 0;
        });
        ents.forEach(e => { if (e.type === 'gate' && e.opening) { e.open = Math.min(1, e.open + dt * 1.6); if (e.open >= 1) e.opening = false; } });
        if (mode !== 'play') return;
        LV.State.elapsed += dt;
        if (busy) return;

        const P = LV.Player;
        P.update(dt, blocked);
        if (LV.Input.takePotion()) usePotion();

        let best = null, bd = 1e9;
        const px = P.cx(), py = P.cy();
        for (const e of ents) {
            const d = Math.hypot(px - (e.x + 16), py - (e.y + 16));
            if (e.type === 'monster' || e.type === 'boss') {
                if (e.alive && d < (e.type === 'boss' ? 46 : 28)) { run(e); return; }
                continue;
            }
            const can = (e.type === 'gate' && e.open < 1 && !e.opening) || (e.type === 'chest' && !e.open) || (e.type === 'puzzle' && !e.done);
            if (can && d < 40 && d < bd) { best = e; bd = d; }
        }
        setPrompt(best);
        const act = LV.Input.takeAction();
        if (act && best) run(best);
    }

    function draw() {
        g.save(); g.clearRect(0, 0, C.W, C.H);
        const o = LV.FX.offset(); g.translate(o[0], o[1]);
        LV.Renderer.drawMap(g, map, t, level.theme);

        const items = [];
        ents.forEach(e => {
            if (e.type === 'gate') items.push([e.y - 1, () => LV.Renderer.gate(g, e.x, e.y, e.open, t)]);
            else if (e.type === 'puzzle') items.push([e.y - 2, () => LV.Renderer.pad(g, e.x, e.y, e.done, t)]);
            else if (e.type === 'chest') items.push([e.y, () => {
                g.drawImage(LV.Sprites.sprite(e.open ? 'chestOpen' : 'chest', 2), e.x, e.y);
                if (!e.open && Math.sin(t * 4 + e.x) > .8) { g.fillStyle = '#fff'; g.fillRect(e.x + 20, e.y + 12, 3, 3); g.fillRect(e.x + 19, e.y + 13, 5, 1); }
            }]);
            else if (e.alive) items.push([e.y, () => LV.Monsters.draw(g, e, t)]);
        });
        if (mode === 'play') items.push([LV.Player.y, () => LV.Player.draw(g)]);
        items.sort((a, b) => a[0] - b[0]).forEach(i => i[1]());

        if (prompt) {
            const ax = prompt.x + 16, ay = prompt.y - 2 + Math.sin(t * 6) * 3;
            g.fillStyle = '#ffd84a'; g.strokeStyle = '#000'; g.lineWidth = 2;
            g.beginPath(); g.moveTo(ax - 6, ay - 9); g.lineTo(ax + 6, ay - 9); g.lineTo(ax, ay); g.closePath(); g.fill(); g.stroke();
        }
        flies.forEach(f => {
            const al = .35 + .65 * Math.abs(Math.sin(t * 2 + f.ph));
            g.fillStyle = `rgba(255,255,150,${al * .25})`; g.fillRect(f.x - 3, f.y - 3, 7, 7);
            g.fillStyle = `rgba(255,255,190,${al})`; g.fillRect(f.x - 1, f.y - 1, 3, 3);
        });
        LV.FX.draw(g); g.restore();
        g.drawImage(vignette, 0, 0);
        LV.FX.overlay(g, C.W, C.H);
    }

    function loop(ts) {
        const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
        if (level) {
            update(dt); draw();
            if (mode === 'play') { hudT += dt; if (hudT > .2) { hudT = 0; LV.HUD.update(); } }
        }
        requestAnimationFrame(loop);
    }

    return { init, start, toMenu, preview, usePotion, doneCount, totalCount, level: () => level, canLeave: () => mode === 'play' && !busy };
})();
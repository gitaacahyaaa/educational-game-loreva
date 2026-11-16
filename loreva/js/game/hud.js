LV.HUD = (() => {
    const $ = id => document.getElementById(id);
    const last = {};
    let heartF, heartE;

    const set = (id, v) => { if (last[id] !== v) { last[id] = v; $(id).textContent = v; } };
    const refreshMute = () => { $('hud-mute').textContent = LV.Audio.isMuted() ? '🔇' : '🔊'; };

    function heartsHTML(hp, max) {
        let h = '';
        for (let i = 0; i < max; i++) h += `<img src="${i < hp ? heartF : heartE}" alt="">`;
        return h;
    }
    function init() {
        heartF = LV.Sprites.icon('heart').toDataURL(); heartE = LV.Sprites.icon('heartEmpty').toDataURL();
        $('hud-coin-ic').src = LV.Sprites.icon('coin').toDataURL();
        $('hud-potion-ic').src = LV.Sprites.icon('potion').toDataURL();
        $('hud-potion').onclick = () => LV.Engine.usePotion();
        $('hud-mute').onclick = () => { LV.Audio.toggle(); refreshMute(); };
        $('hud-menu').onclick = () => {
            if (!LV.Engine.canLeave()) return;
            LV.Progress.save(); LV.Engine.toMenu();
        };
        refreshMute();
    }
    function update() {
        const S = LV.State, E = LV.Engine, lv = E.level();
        const hk = S.hp + '/' + S.maxHp;
        if (last.hk !== hk) { last.hk = hk; $('hud-hearts').innerHTML = heartsHTML(S.hp, S.maxHp); }
        set('hud-name', S.name); set('hud-coins', S.coins); set('hud-potions', S.potions);
        set('hud-time', LV.U.fmtTime(S.elapsed));
        set('hud-level', lv ? `Lv.${S.level} ${lv.name}` : '');
        set('hud-quest', `Misi ${E.doneCount()}/${E.totalCount()}`);
    }
    function toast(msg) {
        const t = $('toast'); t.textContent = msg; t.classList.remove('hidden');
        clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2600);
    }
    function banner(big, small) {
        return new Promise(res => {
            const b = $('banner');
            b.innerHTML = `<h2>${LV.U.esc(big)}</h2><p>${LV.U.esc(small || '')}</p>`;
            b.classList.remove('hidden');
            setTimeout(() => { b.classList.add('hidden'); res(); }, 1700);
        });
    }
    return { init, update, toast, banner, heartsHTML };
})();
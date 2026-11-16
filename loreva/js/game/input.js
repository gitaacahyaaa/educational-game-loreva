LV.Input = (() => {
    const down = new Set();
    let act = false, pot = false;
    const MAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };

    const api = {
        enabled: false,
        axis() { return { x: (down.has('right') ? 1 : 0) - (down.has('left') ? 1 : 0), y: (down.has('down') ? 1 : 0) - (down.has('up') ? 1 : 0) }; },
        takeAction() { const a = act; act = false; return a; },
        takePotion() { const a = pot; pot = false; return a; },
        reset() { down.clear(); act = false; pot = false; document.querySelectorAll('[data-dir].on').forEach(b => b.classList.remove('on')); }
    };

    addEventListener('keydown', e => {
        if (!api.enabled) return;
        const d = MAP[e.code];
        if (d) { down.add(d); e.preventDefault(); }
        else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') { act = true; e.preventDefault(); }
        else if (e.code === 'KeyH') pot = true;
    });
    addEventListener('keyup', e => { const d = MAP[e.code]; if (d) down.delete(d); });
    addEventListener('blur', () => down.clear());

    document.querySelectorAll('[data-dir]').forEach(b => {
        const dir = b.dataset.dir;
        b.addEventListener('pointerdown', e => { e.preventDefault(); down.add(dir); b.classList.add('on'); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
            b.addEventListener(ev, () => { down.delete(dir); b.classList.remove('on'); }));
    });
    const ab = document.getElementById('btn-act');
    if (ab) ab.addEventListener('pointerdown', e => { e.preventDefault(); if (api.enabled) act = true; });

    return api;
})();
// Semua pixel art digambar dari teks + palet warna (tanpa file gambar)
LV.Sprites = (() => {
    const cache = {};
    const memo = (k, fn) => cache[k] || (cache[k] = fn());

    function make(rows, pal, scale, flip, size) {
        const c = document.createElement('canvas');
        c.width = c.height = size * scale;
        const g = c.getContext('2d');
        for (let y = 0; y < Math.min(rows.length, size); y++) {
            for (let x = 0; x < size; x++) {
                const ch = rows[y][x], col = ch && pal[ch];
                if (!col) continue;
                g.fillStyle = col;
                g.fillRect((flip ? size - 1 - x : x) * scale, y * scale, scale, scale);
            }
        }
        return c;
    }

    // Tubuh manusia (13 baris) + 3 baris kaki per frame jalan
    const BODY = [
        '................', '.....oooooo.....', '....ohhhhhho....', '...ohhhhhhhho...',
        '...ohssssssho...', '...osesssseso...', '...osssssssso...', '....oossssoo....',
        '...obbbbbbbbo...', '..obbbbaabbbbo..', '..sobbbbbbbbos..', '..sobaaaaaabos..', '...obbbbbbbbo...'
    ];
    const LEGS = [
        ['....olloollo....', '....olloollo....', '....oooooooo....'],
        ['....olloollo....', '...ollo..ollo...', '...oooo..oooo...'],
        ['....olloollo....', '....ollo..ollo..', '....oooo..oooo..']
    ];

    const SPR = {
        slime: {
            pal: { o: '#1f5a2a', g: '#5fd35f', w: '#c9f8c9', e: '#1a1a2e', m: '#1a1a2e' }, rows: [
                '................', '................', '................', '................', '................',
                '.....oooooo.....', '...ooggggggoo...', '..oggwggggggggo.', '.oggwgggggggggo.', '.oggggggggggggo.',
                '.oggeggggggeggo.', '.oggeggggggeggo.', '.ogggggmmgggggo.', '.oggggggggggggo.', '..oooooooooooo..', '................']
        },
        mushroom: {
            pal: { o: '#3a1a1a', R: '#d94a4a', W: '#ffffff', s: '#ecdcb4', e: '#1a1a2e', m: '#8a2a2a' }, rows: [
                '................', '....oooooooo....', '..ooRRRRRRRRoo..', '.oRRWWRRRRWWRRo.', '.oRWWWRRRRWWWRo.',
                '.oRRWWRRRRWWRRo.', '..oooooooooooo..', '....osssssso....', '....osesseso....', '....osssssso....',
                '....osmmmmso....', '....osssssso....', '...osssssssso...', '...osssssssso...', '...ooo....ooo...', '................']
        },
        treant: {
            pal: { g: '#3fa34d', G: '#2a7a3a', B: '#7a4a2a', o: '#2a1a0f', e: '#ffd84a', m: '#1a0f08' }, rows: [
                '...gg..gg..gg...', '..gGgggGgggGgg..', '.gGgggggggggGgg.', '...oBBBBBBBBo...', '..oBBBBBBBBBBo..',
                '..oBeeBBBBeeBo..', '..oBeeBBBBeeBo..', '..oBBBBBBBBBBo..', '..oBBBmmmmBBBo..', '.oBBBBBBBBBBBBo.',
                'oBBBoBBBBBBoBBBo', 'oBBBoBBBBBBoBBBo', '.ooo.oBBBBo.ooo.', '.....oBBBBo.....', '....oBBBBBBo....', '...oooooooooo...']
        },
        chest: {
            pal: { o: '#2a1a0f', W: '#a8672e', Y: '#ffd84a', y: '#fff3a0' }, rows: [
                '................', '................', '................', '................', '................',
                '...oooooooooo...', '..oWWWWWWWWWWo..', '..oWWWWWWWWWWo..', '..oYYYYYYYYYYo..', '..oWWWWYYWWWWo..',
                '..oWWWWYYWWWWo..', '..oWWWWWWWWWWo..', '..oWWWWWWWWWWo..', '...oooooooooo...', '................', '................']
        },
        chestOpen: {
            pal: { o: '#2a1a0f', W: '#a8672e', Y: '#ffd84a', y: '#fff3a0' }, rows: [
                '................', '................', '...oooooooooo...', '..oWWWWWWWWWWo..', '..oWWWWWWWWWWo..',
                '..oooooooooooo..', '..oYyYyYyYyYyo..', '..oyYyYyYyYyYo..', '..oYyYyYyYyYyo..', '..oWWWWWWWWWWo..',
                '..oWWWWWWWWWWo..', '..oWWWWWWWWWWo..', '..oWWWWWWWWWWo..', '...oooooooooo...', '................', '................']
        }
    };

    const ICO = {
        heart: {
            pal: { o: '#1a1a2e', R: '#ff4a6a', W: '#ffc0cc' }, rows: [
                '.oo..oo.', 'oRRooRRo', 'oRWRRRRo', 'oRRRRRRo', '.oRRRRo.', '..oRRo..', '...oo...', '........']
        },
        heartEmpty: {
            pal: { o: '#1a1a2e', R: '#3a2a4a', W: '#3a2a4a' }, rows: [
                '.oo..oo.', 'oRRooRRo', 'oRWRRRRo', 'oRRRRRRo', '.oRRRRo.', '..oRRo..', '...oo...', '........']
        },
        coin: {
            pal: { o: '#5a3a00', Y: '#ffd84a', y: '#fff3a0' }, rows: [
                '..oooo..', '.oYYYYo.', 'oYYyYYYo', 'oYYyYYYo', 'oYYyYYYo', 'oYYYYYYo', '.oYYYYo.', '..oooo..']
        },
        potion: {
            pal: { o: '#1a1a2e', k: '#8b5a2b', g: '#cfe8ff', R: '#e84a8a', w: '#ffc0e0' }, rows: [
                '...kk...', '...kk...', '..oggo..', '.oRRRRo.', 'oRwRRRRo', 'oRwRRRRo', 'oRRRRRRo', '.oooooo.']
        }
    };

    return {
        human(id, frame, dir) {
            return memo(`h|${id}|${frame}|${dir}`, () => {
                let rows = BODY.concat(LEGS[frame]);
                if (dir === 'up') rows = rows.map((r, i) => (i >= 4 && i <= 7) ? r.replace(/[se]/g, 'h') : r);
                return make(rows, LV.CONFIG.CHARACTERS[id].pal, 2, dir === 'left', 16);
            });
        },
        sprite(name, scale = 2) { return memo(`s|${name}|${scale}`, () => make(SPR[name].rows, SPR[name].pal, scale, false, 16)); },
        icon(name, scale = 3) { return memo(`i|${name}|${scale}`, () => make(ICO[name].rows, ICO[name].pal, scale, false, 8)); }
    };
})();
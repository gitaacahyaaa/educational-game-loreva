window.LV = window.LV || {};

LV.CONFIG = {
    TILE: 32, COLS: 20, ROWS: 14, W: 640, H: 448,
    SPEED: 110,
    KEYS: { settings: 'loreva_settings', progress: 'loreva_progress', packs: 'loreva_packs' },
    CHARACTERS: {
        knight: {
            name: 'Ksatria', desc: '+1 HP maksimum', maxHp: 6, timeBonus: 0, coinMult: 1,
            pal: { o: '#1a1a2e', h: '#aab4cc', s: '#f2c9a0', e: '#1a1a2e', b: '#3a6fd8', a: '#ffd84a', l: '#4a3a2a' }
        },
        mage: {
            name: 'Penyihir', desc: '+6 detik waktu menjawab', maxHp: 5, timeBonus: 6, coinMult: 1,
            pal: { o: '#1a1a2e', h: '#7a3fd0', s: '#f2c9a0', e: '#1a1a2e', b: '#a05ae0', a: '#ffd84a', l: '#3b2a5a' }
        },
        rogue: {
            name: 'Pemburu', desc: 'Hadiah koin x1,5', maxHp: 5, timeBonus: 0, coinMult: 1.5,
            pal: { o: '#1a1a2e', h: '#2e8b57', s: '#e9b98e', e: '#1a1a2e', b: '#3f9f6a', a: '#e0a43c', l: '#5a3a1a' }
        }
    }
};
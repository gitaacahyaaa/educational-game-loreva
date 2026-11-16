// State = data permainan yang sedang berjalan. Progress = simpan/muat ke LocalStorage.
LV.State = {
    name: '', char: 'knight', packId: '', level: 1, hp: 5, maxHp: 5, coins: 0, potions: 1,
    correct: 0, wrong: 0, elapsed: 0, done: {}, rewards: [], log: [], levelsDone: [],

    reset(name, char, packId) {
        const c = LV.CONFIG.CHARACTERS[char];
        Object.assign(this, {
            name, char, packId, level: 1, hp: c.maxHp, maxHp: c.maxHp, coins: 0, potions: 1,
            correct: 0, wrong: 0, elapsed: 0, done: {}, rewards: [], log: [], levelsDone: []
        });
    },
    snapshot() {
        const { name, char, packId, level, hp, maxHp, coins, potions, correct, wrong, elapsed, done, rewards, log, levelsDone } = this;
        return { name, char, packId, level, hp, maxHp, coins, potions, correct, wrong, elapsed, done, rewards, log, levelsDone };
    },
    apply(s) { Object.assign(this, JSON.parse(JSON.stringify(s))); },
    addCoins(n) {
        const v = n > 0 ? Math.round(n * LV.CONFIG.CHARACTERS[this.char].coinMult) : n;
        this.coins = Math.max(0, this.coins + v); return v;
    },
    hurt(n) { this.hp = Math.max(0, this.hp - n); },
    heal(n) { this.hp = Math.min(this.maxHp, this.hp + n); },
    score() { return this.correct * 100 + this.coins * 5 + this.levelsDone.length * 250; }
};

LV.Progress = {
    save() { LV.Storage.set(LV.CONFIG.KEYS.progress, LV.State.snapshot()); },
    load() { return LV.Storage.get(LV.CONFIG.KEYS.progress, null); },
    clear() { LV.Storage.remove(LV.CONFIG.KEYS.progress); },
    totalLevels(pack) { return Math.min((pack && pack.levels) || 5, Object.keys(LV.Levels || {}).length); }
};
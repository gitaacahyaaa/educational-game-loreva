// Simpan hasil ke tabel game_results. Jika gagal (offline), disimpan di antrean LocalStorage dan dikirim ulang otomatis.
LV.Results = {
    PEND: 'loreva_pending_results', sentKey: null, _flushing: false,

    key() { const S = LV.State; return [S.packId, S.name, Math.round(S.elapsed), S.correct, S.wrong, S.coins].join('|'); },
    build() {
        const S = LV.State, pack = LV.Questions.get(S.packId) || {};
        return {
            pack_id: S.packId, player_name: String(S.name || 'Petualang').slice(0, 40), character: S.char,
            subject: pack.subject || '-', total_questions: S.correct + S.wrong, correct: S.correct, wrong: S.wrong,
            score: S.score(), duration_seconds: Math.round(S.elapsed), levels_completed: S.levelsDone.length,
            coins: S.coins, rewards: S.rewards.slice(), details: S.log.slice(0, 300)
        };
    },
    queue() { const q = LV.Storage.get(this.PEND, []); return Array.isArray(q) ? q : []; },
    setQueue(q) { LV.Storage.set(this.PEND, q); },
    permanent(err) { return !!err && (err.code === '42501' || err.code === '23503' || err.code === '23514'); },

    async send(row) {
        if (!LV.DB.client) return { message: 'Koneksi Supabase tidak tersedia.' };
        try { const r = await LV.DB.client.from('game_results').insert(row); return r.error || null; }
        catch (e) { return e; }
    },
    async submit() {
        const k = this.key();
        if (this.sentKey === k) return { ok: true };
        const err = await this.send(this.build());
        if (!err) { this.sentKey = k; this.setQueue(this.queue().filter(i => i.k !== k)); this.flush(); return { ok: true }; }
        if (this.permanent(err)) return { ok: false, permanent: true, error: 'Hasil ditolak server (paket mungkin sudah dinonaktifkan guru).' };
        const q = this.queue(); if (!q.some(i => i.k === k)) q.push({ k, row: this.build() });
        this.setQueue(q.slice(-20));
        return { ok: false, error: LV.DB.msg(err) };
    },
    async flush() {
        if (this._flushing || !this.queue().length) return;
        this._flushing = true;
        try {
            const rest = [];
            for (const it of this.queue()) { const err = await this.send(it.row); if (err && !this.permanent(err)) rest.push(it); }
            this.setQueue(rest);
        } finally { this._flushing = false; }
    }
};
// Bank soal siswa: paket diambil lewat KODE dari guru (RPC get_pack_by_code).
// Paket yang pernah dibuka disimpan di LocalStorage supaya bisa "Lanjutkan" dan dimainkan lagi.
LV.Questions = {
    LEGACY: 'pack-matematika-demo',

    purgeLegacy() {
        const K = LV.CONFIG.KEYS.packs, all = LV.Storage.get(K, []);
        if (!Array.isArray(all)) { LV.Storage.set(K, []); return; }
        const keep = all.filter(p => p && p.id !== this.LEGACY);
        if (keep.length !== all.length) LV.Storage.set(K, keep);
    },
    all() { const p = LV.Storage.get(LV.CONFIG.KEYS.packs, []); return Array.isArray(p) ? p : []; },
    get(id) { return this.all().find(p => p.id === id) || null; },
    forget(id) { LV.Storage.set(LV.CONFIG.KEYS.packs, this.all().filter(p => p.id !== id)); },
    _store(pack) {
        const all = this.all(), i = all.findIndex(p => p.id === pack.id);
        if (i >= 0) all[i] = pack; else all.unshift(pack);
        LV.Storage.set(LV.CONFIG.KEYS.packs, all);
    },

    // satu baris soal database -> format game: {id, type, q, options, answer, accepted, hint, explain}
    _mapQuestion(q) {
        const type = (q.q_type === 'tf' || q.q_type === 'short') ? q.q_type : 'mcq';
        const base = { id: q.id, type, q: q.question, hint: q.hint || '', explain: q.explanation || '' };
        const key = String(q.correct_option || '').trim().toUpperCase();
        if (type === 'short') {
            const acc = (Array.isArray(q.accepted_answers) ? q.accepted_answers : []).map(s => String(s).trim()).filter(Boolean);
            return { ...base, options: [], answer: -1, accepted: acc };
        }
        if (type === 'tf') {
            return { ...base, options: ['Benar', 'Salah'], answer: key === 'A' ? 0 : key === 'B' ? 1 : -1, accepted: [] };
        }
        return {
            ...base, options: [q.option_a, q.option_b, q.option_c, q.option_d],
            answer: key.length === 1 ? 'ABCD'.indexOf(key) : -1, accepted: []
        };
    },
    _valid(q) {
        if (!q.q) return false;
        if (q.type === 'short') return q.accepted.length > 0;
        if (q.type === 'tf') return q.answer >= 0;
        return q.answer >= 0 && q.options.every(o => o && String(o).trim());
    },

    _map(row) {
        const qs = (row.questions || []).slice()
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(q => this._mapQuestion(q))
            .filter(q => this._valid(q));
        return {
            id: row.id, joinCode: row.join_code || '', subject: row.subject, topic: row.topic || '', grade: row.grade || '',
            difficulty: row.difficulty || 'sedang', levels: row.levels || 5, timeLimit: row.time_limit || 25, questions: qs
        };
    },

    // Buka paket dengan kode guru. Hasil: {ok, pack} | {ok:false, notFound?, error}
    async joinByCode(code) {
        const clean = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean.length < 4) return { ok: false, error: 'Kode terlalu pendek. Periksa lagi kode dari gurumu.' };
        if (!LV.DB.client) return { ok: false, error: 'Library Supabase gagal dimuat. Periksa koneksi internet.' };
        try {
            const { data, error } = await LV.DB.client.rpc('get_pack_by_code', { p_code: clean });
            if (error) return { ok: false, error: LV.DB.msg(error) };
            if (!data) return { ok: false, notFound: true, error: 'Kode tidak ditemukan, atau paket belum/tidak lagi dipublikasikan guru.' };
            const pack = this._map(data);
            if (!pack.questions.length) return { ok: false, error: 'Paket ini belum memiliki soal.' };
            this._store(pack);
            return { ok: true, pack };
        } catch (e) { return { ok: false, error: LV.DB.msg(e) }; }
    }
};
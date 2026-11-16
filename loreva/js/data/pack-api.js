// Semua operasi guru. Hak akses sebenarnya dijaga RLS di database.
LV.PackAPI = {
    c() {
        if (!LV.DB.client) throw new Error('Koneksi Supabase tidak tersedia.');
        return LV.DB.client;
    },
    ok(r) { if (r.error) throw r.error; return r.data; },
    uid() { if (!LV.Auth.user) throw new Error('Sesi login berakhir. Silakan masuk lagi.'); return LV.Auth.user.id; },

    /* ---- paket ---- */
    async listPacks() {
        const d = this.ok(await this.c().from('question_packs').select('*, questions(count)')
            .eq('owner_id', this.uid()).order('created_at', { ascending: false }));
        return d.map(p => ({ ...p, qcount: (p.questions && p.questions[0] && p.questions[0].count) || 0 }));
    },
    async createPack(v) {
        return this.ok(await this.c().from('question_packs').insert({ ...v, owner_id: this.uid(), is_published: false }).select().single());
    },
    async updatePack(id, v) {
        return this.ok(await this.c().from('question_packs').update(v).eq('id', id).select().single());
    },
    async setPublished(id, flag) {
        return this.ok(await this.c().from('question_packs').update({ is_published: !!flag }).eq('id', id).select().single());
    },
    async regenerateCode(id) { return this.ok(await this.c().rpc('regenerate_join_code', { p_id: id })); },
    async deletePack(id) { this.ok(await this.c().from('question_packs').delete().eq('id', id)); },

    /* ---- soal ---- */
    async listQuestions(packId) {
        return this.ok(await this.c().from('questions').select('*').eq('pack_id', packId)
            .order('position', { ascending: true }).order('created_at', { ascending: true }));
    },
    async addQuestion(packId, v) { return this.ok(await this.c().from('questions').insert({ ...v, pack_id: packId }).select().single()); },
    async updateQuestion(id, v) { return this.ok(await this.c().from('questions').update(v).eq('id', id).select().single()); },
    async deleteQuestion(id) { this.ok(await this.c().from('questions').delete().eq('id', id)); },

    /* ---- hasil siswa (RLS: hanya paket milik guru ini) ---- */
    async results() {
        return this.ok(await this.c().from('game_results').select('*').order('created_at', { ascending: false }).limit(200));
    }
};
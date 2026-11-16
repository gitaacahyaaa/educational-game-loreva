LV.PackEditor = {
    packs: [], cur: null,
    $(id) { return document.getElementById(id); },
    blank() { return { id: null, subject: '', topic: '', grade: '', difficulty: 'sedang', time_limit: 25, levels: 5, is_published: false, join_code: '', qcount: 0 }; },

    async load() {
        const list = this.$('pack-list');
        if (!this.packs.length) list.innerHTML = '<li class="muted pad">Memuat...</li>';
        try { this.packs = await LV.PackAPI.listPacks(); }
        catch (e) { list.innerHTML = `<li class="err pad">${LV.U.esc(LV.DB.msg(e))}</li>`; return; }
        if (this.cur && this.cur.id) {
            const f = this.packs.find(p => p.id === this.cur.id);
            if (f) { this.cur.qcount = f.qcount; this.cur.is_published = f.is_published; this.cur.join_code = f.join_code; }
        }
        this.renderList(); this.updateHeader();
    },
    renderList() {
        const list = this.$('pack-list');
        if (!this.packs.length) { list.innerHTML = '<li class="muted pad">Belum ada paket. Klik "+ Paket baru".</li>'; return; }
        list.innerHTML = this.packs.map(p =>
            `<li class="pack-item ${this.cur && this.cur.id === p.id ? 'active' : ''}" data-id="${p.id}">
        <b>${LV.U.esc(p.subject || '(tanpa nama)')}</b>
        <small>${LV.U.esc(p.topic || '-')} • ${p.qcount} soal • kode ${LV.U.esc(p.join_code || '-')}</small>
        <span class="badge ${p.is_published ? 'on' : ''}">${p.is_published ? 'Publik' : 'Draft'}</span></li>`).join('');
        list.querySelectorAll('.pack-item').forEach(li => li.onclick = () => this.open(this.packs.find(p => p.id === li.dataset.id)));
    },

    newPack() { this.cur = this.blank(); this.renderList(); this.renderForm(); LV.QuestionEditor.mount(null); },
    open(p) { if (!p) return; this.cur = { ...p }; this.renderList(); this.renderForm(); LV.QuestionEditor.mount(p.id); },

    renderForm() {
        const p = this.cur, isNew = !p.id, E = LV.U.esc, sel = v => p.difficulty === v ? 'selected' : '';
        const codeBox = isNew ? '' : `
      <div class="code-box">
        <div class="grow">
          <small class="muted">Kode paket untuk siswa</small>
          <div class="code" id="pk-code">${E(p.join_code || '------')}</div>
          <small class="muted">Siswa hanya bisa masuk jika paket berstatus Publik.</small>
        </div>
        <button id="pk-copy" class="btn" type="button">Salin kode</button>
        <button id="pk-regen" class="btn" type="button">Kode baru</button>
      </div>`;
        this.$('editor').innerHTML = `
      <div class="ed-head">
        <h2>${isNew ? 'Paket Baru' : E(p.subject)}</h2>
        <div class="ed-actions">
          <span id="pk-status" class="badge"></span>
          <button id="pk-publish" class="btn" ${isNew ? 'hidden' : ''}></button>
          <button id="pk-delete" class="btn danger" ${isNew ? 'hidden' : ''}>Hapus</button>
        </div>
      </div>
      ${codeBox}
      <form id="pk-form" class="grid">
        <label>Mata pelajaran *<input id="pk-subject" maxlength="60" required value="${E(p.subject)}"></label>
        <label>Topik<input id="pk-topic" maxlength="80" value="${E(p.topic || '')}"></label>
        <label>Kelas / jenjang<input id="pk-grade" maxlength="40" value="${E(p.grade || '')}"></label>
        <label>Tingkat kesulitan
          <select id="pk-diff"><option value="mudah" ${sel('mudah')}>Mudah (waktu lebih lama)</option>
            <option value="sedang" ${sel('sedang')}>Sedang</option><option value="sulit" ${sel('sulit')}>Sulit (waktu lebih singkat)</option></select></label>
        <label>Batas waktu menjawab (detik)<input id="pk-time" type="number" min="5" max="120" value="${+p.time_limit || 25}"></label>
        <label>Jumlah level (1-5)<input id="pk-levels" type="number" min="1" max="5" value="${+p.levels || 5}"></label>
        <div class="full"><button class="btn primary" type="submit">${isNew ? 'Buat paket' : 'Simpan perubahan'}</button></div>
      </form>
      <div id="q-section"></div>`;
        this.$('pk-form').onsubmit = e => { e.preventDefault(); this.save(); };
        this.$('pk-publish').onclick = () => this.togglePublish();
        this.$('pk-delete').onclick = () => this.remove();
        if (!isNew) { this.$('pk-copy').onclick = () => this.copyCode(); this.$('pk-regen').onclick = () => this.regenCode(); }
        this.updateHeader();
    },
    updateHeader() {
        const p = this.cur; if (!p || !this.$('pk-status')) return;
        this.$('pk-status').textContent = p.is_published ? 'Publik' : 'Draft';
        this.$('pk-status').className = 'badge' + (p.is_published ? ' on' : '');
        this.$('pk-publish').textContent = p.is_published ? 'Nonaktifkan' : 'Publikasikan';
        if (this.$('pk-code')) this.$('pk-code').textContent = p.join_code || '------';
    },
    read() {
        const n = (id, a, b, d) => { const v = parseInt(this.$(id).value, 10); return isNaN(v) ? d : Math.max(a, Math.min(b, v)); };
        return {
            subject: this.$('pk-subject').value.trim(), topic: this.$('pk-topic').value.trim(), grade: this.$('pk-grade').value.trim(),
            difficulty: this.$('pk-diff').value, time_limit: n('pk-time', 5, 120, 25), levels: n('pk-levels', 1, 5, 5)
        };
    },

    async copyCode() {
        const code = this.cur.join_code || '';
        try { await navigator.clipboard.writeText(code); LV.Admin.toast('Kode disalin: ' + code); }
        catch (e) { prompt('Salin kode ini:', code); }
    },
    async regenCode() {
        if (!confirm('Buat kode baru? Kode lama langsung tidak bisa dipakai, jadi siswa harus memasukkan kode yang baru.')) return;
        try {
            const code = await LV.PackAPI.regenerateCode(this.cur.id);
            LV.Admin.toast('Kode baru: ' + code);
            await this.load();
            this.open(this.packs.find(p => p.id === this.cur.id) || this.cur);
        } catch (e) { LV.Admin.toast(LV.DB.msg(e), 'err'); }
    },

    async save() {
        const v = this.read();
        if (!v.subject) return LV.Admin.toast('Nama mata pelajaran wajib diisi.', 'err');
        const btn = this.$('pk-form').querySelector('button[type=submit]'); btn.disabled = true;
        try {
            let row;
            if (this.cur.id) { row = await LV.PackAPI.updatePack(this.cur.id, v); LV.Admin.toast('Paket diperbarui.'); }
            else { row = await LV.PackAPI.createPack(v); LV.Admin.toast('Paket dibuat. Sekarang tambahkan soal!'); }
            this.cur = { ...row, qcount: this.cur.qcount || 0 };
            await this.load();
            this.open(this.packs.find(p => p.id === row.id) || this.cur);
        } catch (e) { LV.Admin.toast(LV.DB.msg(e), 'err'); btn.disabled = false; }
    },
    async togglePublish() {
        const p = this.cur, next = !p.is_published;
        if (next) {
            if (!p.qcount) return LV.Admin.toast('Tambahkan minimal 1 soal sebelum dipublikasikan.', 'err');
            if (p.qcount < 12 && !confirm(`Paket ini baru punya ${p.qcount} soal. Disarankan minimal 12 agar soal tidak sering berulang dalam satu permainan. Tetap publikasikan?`)) return;
        }
        try {
            await LV.PackAPI.setPublished(p.id, next);
            LV.Admin.toast(next ? `Dipublikasikan. Bagikan kode ${p.join_code} ke siswa.` : 'Paket dinonaktifkan. Siswa tidak bisa lagi membukanya.');
            await this.load();
        } catch (e) { LV.Admin.toast(LV.DB.msg(e), 'err'); }
    },
    async remove() {
        const p = this.cur;
        if (!confirm(`Hapus paket "${p.subject}" beserta SEMUA soalnya? Tindakan ini tidak bisa dibatalkan.`)) return;
        try {
            await LV.PackAPI.deletePack(p.id);
            LV.Admin.toast('Paket dihapus.');
            this.cur = null; this.$('editor').innerHTML = '<p class="muted pad">Pilih paket di kiri, atau buat paket baru.</p>';
            await this.load();
        } catch (e) { LV.Admin.toast(LV.DB.msg(e), 'err'); }
    }
};
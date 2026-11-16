LV.QuestionEditor = {
    packId: null, items: [], editing: null,
    TYPES: { mcq: 'Pilihan ganda', tf: 'Benar/Salah', short: 'Isian singkat' },
    $(id) { return document.getElementById(id); },

    init() {
        this.$('m-cancel').onclick = () => this.closeForm();
        this.$('modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') this.closeForm(); });
        this.$('q-form').onsubmit = e => { e.preventDefault(); this.save(); };
        this.$('m-type').onchange = () => this.showType(this.$('m-type').value);
    },
    showType(t) {
        this.$('grp-mcq').classList.toggle('hidden', t !== 'mcq');
        this.$('grp-tf').classList.toggle('hidden', t !== 'tf');
        this.$('grp-short').classList.toggle('hidden', t !== 'short');
    },

    mount(packId) {
        this.packId = packId; this.items = [];
        const box = this.$('q-section');
        if (!packId) { box.innerHTML = '<p class="muted">Simpan paket terlebih dahulu untuk mulai menambahkan soal.</p>'; return; }
        box.innerHTML = `<div class="q-head"><h3>Daftar Soal <span id="q-count" class="badge"></span></h3>
      <button id="btn-add-q" class="btn primary">+ Tambah soal</button></div><div id="q-list"></div>`;
        this.$('btn-add-q').onclick = () => this.openForm(null);
        this.load();
    },
    async load() {
        const list = this.$('q-list'); if (!list) return;
        list.innerHTML = '<p class="muted">Memuat...</p>';
        try { this.items = await LV.PackAPI.listQuestions(this.packId); }
        catch (e) { list.innerHTML = `<p class="err">${LV.U.esc(LV.DB.msg(e))}</p>`; return; }
        this.render();
    },

    preview(q) {
        const E = LV.U.esc, t = q.q_type || 'mcq';
        if (t === 'short') {
            const a = Array.isArray(q.accepted_answers) ? q.accepted_answers : [];
            return `<div class="q-opts one"><span class="ok">Jawaban: ${E(a.join(' / ') || '(kosong)')}</span></div>`;
        }
        if (t === 'tf') {
            const A = q.correct_option === 'A';
            return `<div class="q-opts"><span class="${A ? 'ok' : ''}">Benar${A ? ' ✓' : ''}</span><span class="${A ? '' : 'ok'}">Salah${A ? '' : ' ✓'}</span></div>`;
        }
        return `<div class="q-opts">${['A', 'B', 'C', 'D'].map(L =>
            `<span class="${q.correct_option === L ? 'ok' : ''}">${L}. ${E(q['option_' + L.toLowerCase()] || '')}${q.correct_option === L ? ' ✓' : ''}</span>`).join('')}</div>`;
    },
    render() {
        const list = this.$('q-list'); if (!list) return; const E = LV.U.esc;
        this.$('q-count').textContent = this.items.length + ' soal';
        if (!this.items.length) { list.innerHTML = '<p class="muted">Belum ada soal. Klik "+ Tambah soal".</p>'; return; }
        list.innerHTML = this.items.map((q, i) => `
      <div class="q-item"><div class="q-no">${i + 1}</div>
        <div class="q-body"><p>${E(q.question)} <span class="type-tag">${this.TYPES[q.q_type || 'mcq'] || 'Pilihan ganda'}</span></p>
          ${this.preview(q)}
        </div>
        <div class="q-act"><button class="btn" data-edit="${q.id}">Edit</button><button class="btn danger" data-del="${q.id}">Hapus</button></div>
      </div>`).join('');
        list.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => this.openForm(this.items.find(q => q.id === b.dataset.edit)));
        list.querySelectorAll('[data-del]').forEach(b => b.onclick = () => this.remove(b.dataset.del));
    },

    openForm(q) {
        this.editing = q;
        const t = q ? (q.q_type || 'mcq') : 'mcq';
        this.$('m-title').textContent = q ? 'Edit Soal' : 'Tambah Soal';
        this.$('m-type').value = t; this.showType(t);
        this.$('m-q').value = q ? q.question : '';
        ['a', 'b', 'c', 'd'].forEach(l => this.$('m-' + l).value = (q && t === 'mcq') ? (q['option_' + l] || '') : '');
        const wantMcq = (q && t === 'mcq') ? q.correct_option : 'A';
        document.querySelectorAll('input[name=m-correct]').forEach(r => r.checked = r.value === wantMcq);
        const wantTf = (q && t === 'tf') ? q.correct_option : 'A';
        document.querySelectorAll('input[name=m-tf]').forEach(r => r.checked = r.value === wantTf);
        this.$('m-acc').value = (q && t === 'short' && Array.isArray(q.accepted_answers)) ? q.accepted_answers.join('\n') : '';
        this.$('m-hint').value = q ? (q.hint || '') : '';
        this.$('m-exp').value = q ? (q.explanation || '') : '';
        this.$('modal').classList.remove('hidden'); this.$('m-q').focus();
    },
    closeForm() { this.$('modal').classList.add('hidden'); this.editing = null; },

    collect() {
        const type = this.$('m-type').value;
        const base = {
            q_type: type, question: this.$('m-q').value.trim(),
            hint: this.$('m-hint').value.trim(), explanation: this.$('m-exp').value.trim()
        };
        if (!base.question) return { error: 'Pertanyaan wajib diisi.' };
        if (!base.explanation) return { error: 'Pembahasan wajib diisi.' };

        if (type === 'mcq') {
            const o = ['a', 'b', 'c', 'd'].map(l => this.$('m-' + l).value.trim());
            if (o.some(x => !x)) return { error: 'Keempat pilihan jawaban wajib diisi.' };
            const c = (document.querySelector('input[name=m-correct]:checked') || {}).value || 'A';
            return { v: { ...base, option_a: o[0], option_b: o[1], option_c: o[2], option_d: o[3], correct_option: c, accepted_answers: [] } };
        }
        if (type === 'tf') {
            const c = (document.querySelector('input[name=m-tf]:checked') || {}).value || 'A';
            return { v: { ...base, option_a: 'Benar', option_b: 'Salah', option_c: null, option_d: null, correct_option: c, accepted_answers: [] } };
        }
        // isian singkat
        const seen = {}, acc = [];
        this.$('m-acc').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean).forEach(s => {
            const k = s.toLowerCase(); if (!seen[k]) { seen[k] = 1; acc.push(s.slice(0, 80)); }
        });
        if (!acc.length) return { error: 'Isi minimal satu jawaban yang benar.' };
        return { v: { ...base, option_a: null, option_b: null, option_c: null, option_d: null, correct_option: 'A', accepted_answers: acc.slice(0, 10) } };
    },

    async save() {
        const r = this.collect();
        if (r.error) return LV.Admin.toast(r.error, 'err');
        const btn = this.$('m-save'); btn.disabled = true;
        try {
            if (this.editing) await LV.PackAPI.updateQuestion(this.editing.id, r.v);
            else await LV.PackAPI.addQuestion(this.packId, { ...r.v, position: this.items.length + 1 });
            LV.Admin.toast(this.editing ? 'Soal diperbarui.' : 'Soal ditambahkan.');
            this.closeForm(); await this.load(); LV.PackEditor.load();
        } catch (e) { LV.Admin.toast(LV.DB.msg(e), 'err'); }
        finally { btn.disabled = false; }
    },
    async remove(id) {
        if (!confirm('Hapus soal ini?')) return;
        try { await LV.PackAPI.deleteQuestion(id); LV.Admin.toast('Soal dihapus.'); await this.load(); LV.PackEditor.load(); }
        catch (e) { LV.Admin.toast(LV.DB.msg(e), 'err'); }
    }
};
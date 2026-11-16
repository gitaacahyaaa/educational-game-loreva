LV.PackSelect = {
    busy: false,
    init() { document.getElementById('btn-pack-back').onclick = () => LV.CharSelect.open(); },

    open() {
        LV.UI.show('pack');
        const box = document.getElementById('pack-list');
        box.innerHTML =
            `<div class="codebox">
         <label>Masukkan kode paket dari gurumu
           <input id="in-code" maxlength="10" placeholder="K7M2QX" autocomplete="off" autocapitalize="characters" spellcheck="false">
         </label>
         <button id="btn-join" class="btn">GABUNG ▶</button>
       </div>
       <p id="join-msg" class="notice hidden"></p>
       <h3 class="subh">PAKET TERSIMPAN DI PERANGKAT INI</h3>
       <div id="saved-packs"></div>`;
        const input = document.getElementById('in-code');
        document.getElementById('btn-join').onclick = () => this.join();
        input.addEventListener('keydown', e => { if (e.key === 'Enter') this.join(); });
        input.addEventListener('input', () => { input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
        this.renderSaved();
    },

    msg(text, warn) {
        const m = document.getElementById('join-msg'); if (!m) return;
        m.textContent = text || ''; m.classList.toggle('hidden', !text); m.classList.toggle('warn', !!warn);
    },

    renderSaved() {
        const wrap = document.getElementById('saved-packs'); if (!wrap) return;
        const packs = LV.Questions.all().filter(p => p.joinCode && p.questions && p.questions.length);
        wrap.innerHTML = '';
        if (!packs.length) { wrap.innerHTML = '<p class="notice">Belum ada paket. Minta kode paket ke gurumu.</p>'; return; }
        packs.forEach(p => {
            const b = document.createElement('button'); b.className = 'pack';
            b.innerHTML = `<strong>${LV.U.esc(p.subject)}${p.topic ? ' — ' + LV.U.esc(p.topic) : ''}</strong>` +
                `<span>${LV.U.esc(p.grade || '-')} • ${p.questions.length} soal • ${LV.U.esc(p.difficulty)} • ⏱ ${p.timeLimit} dtk • kode ${LV.U.esc(p.joinCode)}</span>`;
            b.onclick = () => this.playSaved(p);
            wrap.appendChild(b);
        });
    },

    async join() {
        if (this.busy) return;
        const code = document.getElementById('in-code').value, btn = document.getElementById('btn-join');
        this.busy = true; btn.disabled = true; btn.textContent = 'MEMUAT...'; this.msg('');
        const r = await LV.Questions.joinByCode(code);
        this.busy = false; btn.disabled = false; btn.textContent = 'GABUNG ▶';
        if (!r.ok) return this.msg(r.error, !r.notFound);
        this.start(r.pack);
    },

    // paket tersimpan: coba ambil versi terbaru, kalau offline pakai cache
    async playSaved(p) {
        if (this.busy) return;
        this.busy = true; this.msg('⏳ Memeriksa pembaruan paket...');
        const r = await LV.Questions.joinByCode(p.joinCode);
        this.busy = false;
        if (r.ok) return this.start(r.pack);
        if (r.notFound) {
            LV.Questions.forget(p.id); this.renderSaved();
            return this.msg('Paket ini sudah dinonaktifkan atau kodenya diganti guru. Minta kode terbaru ke gurumu.');
        }
        this.msg('');
        this.start(p); // offline: pakai salinan tersimpan
    },

    start(p) {
        LV.Audio.play('click');
        LV.State.reset(LV.CharSelect.name(), LV.CharSelect.sel, p.id);
        LV.Engine.start();
    }
};
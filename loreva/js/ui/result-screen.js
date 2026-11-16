LV.Result = {
    init() {
        const $ = id => document.getElementById(id);
        $('btn-csv').onclick = () => LV.Report.download();
        $('btn-again').onclick = () => LV.CharSelect.open();
        $('btn-res-menu').onclick = () => LV.UI.showMenu();
        $('btn-sync').onclick = () => this.sync();
    },
    render() {
        const S = LV.State, pack = LV.Questions.get(S.packId) || { subject: '-' };
        const total = S.correct + S.wrong, acc = total ? Math.round(S.correct / total * 100) : 0;
        const rank = acc >= 90 ? '🏆 Sage Agung' : acc >= 70 ? '⭐ Penjelajah Bijak' : acc >= 50 ? '🛡 Petualang Gigih' : '🌱 Murid Pemberani';
        const st = [
            ['Pemain', S.name], ['Mata Pelajaran', pack.subject], ['Jumlah Soal', total], ['Akurasi', acc + '%'],
            ['Jawaban Benar', S.correct], ['Jawaban Salah', S.wrong], ['Waktu Bermain', LV.U.fmtTime(S.elapsed)],
            ['Level Selesai', `${S.levelsDone.length} / ${LV.Progress.totalLevels(pack)}`], ['Koin', S.coins], ['Ramuan Tersisa', S.potions]
        ];
        document.getElementById('res-body').innerHTML =
            `<div class="res-score">${S.score()}</div><div class="res-rank">${rank}</div>` +
            `<div class="stats">${st.map(s => `<div class="stat"><small>${s[0]}</small>${LV.U.esc(s[1])}</div>`).join('')}</div>` +
            `<div class="rewards"><b>Hadiah:</b><ul>${(S.rewards.length ? S.rewards : ['(belum ada)']).map(r => `<li>${LV.U.esc(r)}</li>`).join('')}</ul></div>`;
        this.sync();
    },
    async sync() {
        const el = document.getElementById('res-sync'), btn = document.getElementById('btn-sync');
        btn.classList.add('hidden'); el.textContent = '⏳ Menyimpan hasil ke server...';
        const r = await LV.Results.submit();
        if (r.ok) { el.textContent = '✓ Hasil tersimpan online'; return; }
        el.textContent = '⚠ ' + r.error + (r.permanent ? '' : ' Hasil disimpan di perangkat dan akan dikirim otomatis nanti.');
        if (!r.permanent) btn.classList.remove('hidden');
    }
};
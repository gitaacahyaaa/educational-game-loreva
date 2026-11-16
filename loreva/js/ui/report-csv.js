LV.Report = {
    build() {
        const S = LV.State, pack = LV.Questions.get(S.packId) || { subject: '-', grade: '-' };
        const total = S.correct + S.wrong, q = v => '"' + String(v).replace(/"/g, '""') + '"';
        const rows = [
            ['LOREVA - Laporan Hasil Permainan'],
            ['Nama Pemain', S.name], ['Mata Pelajaran', pack.subject], ['Kelas', pack.grade || '-'],
            ['Jumlah Soal Dijawab', total], ['Jawaban Benar', S.correct], ['Jawaban Salah', S.wrong],
            ['Skor Akhir', S.score()], ['Waktu Bermain', LV.U.fmtTime(S.elapsed)],
            ['Level Diselesaikan', `${S.levelsDone.length}/${LV.Progress.totalLevels(pack)}`],
            ['Koin Dikumpulkan', S.coins], ['Hadiah', S.rewards.join('; ')], [],
            ['No', 'Pertanyaan', 'Jawaban Pemain', 'Kunci Jawaban', 'Status', 'Waktu (detik)']
        ];
        S.log.forEach((l, i) => rows.push([i + 1, l.q, l.chosen, l.right, l.ok ? 'Benar' : 'Salah', l.time]));
        return '\ufeff' + rows.map(r => r.map(q).join(',')).join('\r\n');
    },
    download() {
        const blob = new Blob([this.build()], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `loreva-laporan-${LV.State.name.replace(/\W+/g, '_')}.csv`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
};
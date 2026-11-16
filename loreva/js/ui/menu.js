LV.UI = {
    show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('hidden', s.id !== 'scr-' + id)); },
    hideAll() { document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); },
    showMenu() {
        this.show('menu');
        const s = LV.Progress.load();
        document.getElementById('btn-continue').disabled = !s;
        document.getElementById('continue-info').textContent = s
            ? `${s.name} • Level ${s.level} • ${s.coins} koin • ${LV.U.fmtTime(s.elapsed)}`
            : 'Belum ada progres tersimpan';
    },
    showResult() { LV.Result.render(); this.show('result'); }
};

LV.Menu = {
    init() {
        const $ = id => document.getElementById(id);
        const sound = () => { $('btn-sound').textContent = LV.Audio.isMuted() ? '🔇 SUARA MATI' : '🔊 SUARA'; };
        $('btn-new').onclick = () => { LV.Audio.play('click'); LV.CharSelect.open(); };
        $('btn-continue').onclick = () => {
            LV.Audio.play('click');
            const s = LV.Progress.load(); if (!s) return;
            if (!LV.Questions.get(s.packId)) {
                alert('Paket soal untuk progres ini sudah tidak tersedia (mungkin dinonaktifkan guru). Progresmu tetap tersimpan. Mulai petualangan baru dengan paket lain.');
                return;
            }
            LV.State.apply(s); LV.Engine.start();
        };
        $('btn-sound').onclick = () => { LV.Audio.toggle(); sound(); LV.Audio.play('click'); };
        sound();
    }
};
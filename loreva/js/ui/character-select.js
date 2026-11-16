LV.CharSelect = {
    sel: 'knight',
    init() {
        const st = LV.Storage.settings();
        if (st.char && LV.CONFIG.CHARACTERS[st.char]) this.sel = st.char;
        document.getElementById('in-name').value = st.name || '';
        const wrap = document.getElementById('char-cards'); wrap.innerHTML = '';
        Object.entries(LV.CONFIG.CHARACTERS).forEach(([id, c]) => {
            const d = document.createElement('div');
            d.className = 'card'; d.dataset.id = id;
            d.innerHTML = `<img src="${LV.Sprites.human(id, 0, 'down').toDataURL()}" alt=""><h3>${c.name}</h3><p>${c.desc}</p><small>HP ${c.maxHp}</small>`;
            d.onclick = () => { this.sel = id; this.mark(); LV.Audio.play('click'); };
            wrap.appendChild(d);
        });
        this.mark();
        document.getElementById('btn-char-back').onclick = () => LV.UI.showMenu();
        document.getElementById('btn-char-next').onclick = () => {
            LV.Audio.play('click');
            LV.Storage.setSetting('name', this.name()); LV.Storage.setSetting('char', this.sel);
            LV.PackSelect.open();
        };
    },
    mark() { document.querySelectorAll('#char-cards .card').forEach(c => c.classList.toggle('sel', c.dataset.id === this.sel)); },
    name() { return (document.getElementById('in-name').value.trim() || 'Petualang').slice(0, 14); },
    open() { LV.UI.show('char'); }
};
LV.Admin = {
    $(id) { return document.getElementById(id); },

    toast(msg, type) {
        const t = this.$('toast');
        t.textContent = msg; t.className = 'toast ' + (type === 'err' ? 'err' : 'ok');
        clearTimeout(this._t); this._t = setTimeout(() => t.classList.add('hidden'), 3800);
    },
    showLogin(msg) {
        this.$('app-view').classList.add('hidden'); this.$('auth-view').classList.remove('hidden');
        if (msg !== undefined) this.$('login-msg').textContent = msg;
    },
    showApp() {
        this.$('auth-view').classList.add('hidden'); this.$('app-view').classList.remove('hidden');
        this.$('who').textContent = (LV.Auth.profile && LV.Auth.profile.email) || LV.Auth.user.email || '';
        this.tab('packs'); LV.PackEditor.load();
    },
    tab(name) {
        ['packs', 'results'].forEach(n => {
            this.$('tab-' + n).classList.toggle('hidden', n !== name);
            this.$('nav-' + n).classList.toggle('active', n === name);
        });
        if (name === 'results') this.loadResults();
    },

    async loadResults() {
        const box = this.$('results-body'); box.innerHTML = '<p class="muted pad">Memuat...</p>';
        try {
            const rows = await LV.PackAPI.results();
            if (!rows.length) { box.innerHTML = '<p class="muted pad">Belum ada hasil permainan.</p>'; return; }
            box.innerHTML = '<table><thead><tr><th>Waktu</th><th>Pemain</th><th>Mapel</th><th>Benar</th><th>Salah</th><th>Skor</th><th>Durasi</th></tr></thead><tbody>' +
                rows.map(r => `<tr><td>${LV.U.esc(new Date(r.created_at).toLocaleString('id-ID'))}</td><td>${LV.U.esc(r.player_name)}</td><td>${LV.U.esc(r.subject || '-')}</td><td>${r.correct}</td><td>${r.wrong}</td><td><b>${r.score}</b></td><td>${LV.U.fmtTime(r.duration_seconds || 0)}</td></tr>`).join('') +
                '</tbody></table>';
        } catch (e) { box.innerHTML = `<p class="err pad">${LV.U.esc(LV.DB.msg(e))}</p>`; }
    },

    async init() {
        LV.QuestionEditor.init();
        this.$('nav-packs').onclick = () => this.tab('packs');
        this.$('nav-results').onclick = () => this.tab('results');
        this.$('btn-reload-results').onclick = () => this.loadResults();
        this.$('btn-new-pack').onclick = () => LV.PackEditor.newPack();
        this.$('btn-logout').onclick = async () => {
            try { await LV.Auth.signOut(); } catch (e) { }
            this.showLogin('Kamu sudah keluar.');
        };
        LV.Auth.onSignOut = () => {
            if (!this.$('app-view').classList.contains('hidden')) this.showLogin('Sesi berakhir. Silakan masuk lagi.');
        };
        this.$('login-form').addEventListener('submit', async e => {
            e.preventDefault();
            const btn = this.$('login-btn'); btn.disabled = true; btn.textContent = 'Masuk...'; this.$('login-msg').textContent = '';
            try { await LV.Auth.signIn(this.$('login-email').value.trim(), this.$('login-pass').value); this.$('login-pass').value = ''; this.showApp(); }
            catch (err) { this.$('login-msg').textContent = LV.DB.msg(err); }
            finally { btn.disabled = false; btn.textContent = 'Masuk'; }
        });

        if (!LV.DB.client) {
            this.$('login-btn').disabled = true;
            return this.showLogin('Library Supabase gagal dimuat. Periksa koneksi internet lalu muat ulang.');
        }
        try { (await LV.Auth.init()) ? this.showApp() : this.showLogin(''); }
        catch (e) { this.showLogin(LV.DB.msg(e)); }
    }
};
document.addEventListener('DOMContentLoaded', () => LV.Admin.init());
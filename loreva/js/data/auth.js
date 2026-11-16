LV.Auth = {
    user: null, profile: null, onSignOut: null,
    c() {
        if (!LV.DB.client) throw new Error('Library Supabase gagal dimuat. Periksa internet lalu muat ulang halaman.');
        return LV.DB.client;
    },
    isTeacher() { return !!(this.user && this.profile && this.profile.role === 'teacher'); },

    async loadProfile() {
        const r = await this.c().from('profiles').select('id,email,full_name,role').eq('id', this.user.id).maybeSingle();
        if (r.error) throw r.error;
        this.profile = r.data;
    },
    async init() {
        const c = this.c();
        c.auth.onAuthStateChange(ev => {
            if (ev === 'SIGNED_OUT') { this.user = null; this.profile = null; if (this.onSignOut) this.onSignOut(); }
        });
        const { data, error } = await c.auth.getSession();
        if (error) throw error;
        this.user = data.session ? data.session.user : null;
        if (!this.user) return false;
        await this.loadProfile();
        if (!this.isTeacher()) { await this.signOut(); return false; }
        return true;
    },
    async signIn(email, password) {
        const c = this.c();
        const { data, error } = await c.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.user = data.user;
        await this.loadProfile();
        if (!this.isTeacher()) {
            await c.auth.signOut();
            throw new Error('Akun ini bukan akun guru (role di tabel profiles harus "teacher").');
        }
        return this.profile;
    },
    async signOut() {
        try { await this.c().auth.signOut(); } finally { this.user = null; this.profile = null; }
    }
};
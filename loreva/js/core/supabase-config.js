window.LV = window.LV || {};

// Publishable key AMAN di frontend (keamanan dijaga RLS). JANGAN pernah taruh service_role di sini.
LV.SUPABASE = {
    url: 'https://clonrmodehhildxrxuwh.supabase.co',
    key: 'sb_publishable_oSl7LokRry6Gu8AQCo-TiA_olXBoBf0'
};

LV.DB = {
    client: null,
    init() {
        try {
            if (window.supabase && window.supabase.createClient) {
                this.client = window.supabase.createClient(LV.SUPABASE.url, LV.SUPABASE.key, {
                    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'loreva_auth' }
                });
            }
        } catch (e) { console.error('Supabase init gagal', e); }
    },
    // pesan error ramah untuk pengguna
    msg(e) {
        const m = (e && (e.message || String(e))) || 'Terjadi kesalahan.';
        if (/failed to fetch|network|load failed|fetch/i.test(m)) return 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
        if (/invalid login/i.test(m)) return 'Email atau password salah.';
        if (/email not confirmed/i.test(m)) return 'Email belum dikonfirmasi.';
        if (/row-level security|permission denied/i.test(m)) return 'Akses ditolak database (bukan akun guru atau bukan pemilik data).';
        return m;
    }
};
LV.DB.init();
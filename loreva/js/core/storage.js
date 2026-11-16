LV.Storage = {
    get(k, fb = null) { try { const v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    remove(k) { try { localStorage.removeItem(k); } catch (e) { } },
    settings() { return this.get(LV.CONFIG.KEYS.settings, {}); },
    setSetting(k, v) { const s = this.settings(); s[k] = v; this.set(LV.CONFIG.KEYS.settings, s); }
};
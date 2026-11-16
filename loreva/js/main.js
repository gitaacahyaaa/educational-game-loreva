document.addEventListener('DOMContentLoaded', () => {
    LV.Questions.purgeLegacy();   // buang paket contoh lama dari cache (progres aman)
    LV.HUD.init();
    LV.Engine.init();
    LV.Menu.init();
    LV.CharSelect.init();
    LV.PackSelect.init();
    LV.Result.init();
    LV.Engine.preview();
    LV.UI.showMenu();
    LV.Results.flush();           // kirim hasil yang tertunda (jika ada)
    document.addEventListener('pointerdown', () => LV.Audio.unlock(), { once: true });
});
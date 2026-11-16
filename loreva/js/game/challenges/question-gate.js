LV.Challenges = LV.Challenges || {};

LV.Challenges.gate = async function (g) {
    const res = await LV.Quiz.ask({ title: '🚪 QUESTION GATE', sub: 'Gerbang kuno terkunci. Jawab dengan benar untuk membukanya!' });
    const cx = g.x + 16, cy = g.y + 16;
    LV.Quiz.fx(res, cx, cy);
    if (res.ok) {
        g.opening = true; LV.State.done[g.key] = true;
        LV.Audio.play('open'); LV.FX.text(cx, g.y - 14, 'GERBANG TERBUKA!', '#7dff9a');
    } else {
        LV.HUD.toast('Gerbang tetap terkunci. Coba lagi!');
    }
};
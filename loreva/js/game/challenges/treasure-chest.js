LV.Challenges = LV.Challenges || {};

LV.Challenges.chest = async function (c) {
    const S = LV.State;
    c.open = true; S.done[c.key] = true;
    const coins = S.addCoins(LV.U.randInt(8, 16));
    let msg = `+${coins} koin`;
    if (Math.random() < .6) { S.potions++; msg += ' & 1 Ramuan'; }
    S.rewards.push('Peti harta: ' + msg);
    LV.Audio.play('open');
    LV.FX.stars(c.x + 16, c.y + 8);
    LV.FX.text(c.x + 16, c.y - 4, msg, '#ffd84a');
    LV.HUD.toast('🎁 Peti terbuka: ' + msg);
};
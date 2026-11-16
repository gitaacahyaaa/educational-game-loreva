LV.Challenges = LV.Challenges || {};

LV.Challenges.puzzle = async function (p) {
    const S = LV.State; let right = 0;
    for (let i = 0; i < 2; i++) {
        const res = await LV.Quiz.ask({ title: '🔮 PUZZLE AREA', sub: `Rune kuno ${i + 1} dari 2 — pecahkan teka-tekinya!` });
        LV.Quiz.fx(res, p.x + 16, p.y + 16);
        if (res.ok) right++;
    }
    p.done = true; S.done[p.key] = true;
    const bonus = S.addCoins(right * 6);
    if (right === 2) {
        S.rewards.push('Batu Rune Kebijaksanaan'); LV.Audio.play('open');
        LV.HUD.toast(`✨ Rune bersinar! Batu Rune + ${bonus} koin`);
    } else {
        LV.HUD.toast(right === 1 ? `Rune redup... +${bonus} koin` : 'Rune padam. Pelajari pembahasannya ya!');
    }
};
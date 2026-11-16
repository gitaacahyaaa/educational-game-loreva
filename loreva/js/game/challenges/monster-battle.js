LV.Challenges = LV.Challenges || {};

LV.Challenges.battle = async function (m, isBoss) {
    const S = LV.State, d = LV.Monsters.types[m.kind];
    const pUrl = LV.Sprites.human(S.char, 0, 'right').toDataURL();
    const mUrl = LV.Sprites.sprite(d.sprite, d.scale).toDataURL();
    const duel = () => ({ player: pUrl, monster: mUrl, msize: d.size, mName: d.name, mHp: m.hp, mMax: m.maxHp });
    const cx = m.x + 16, cy = m.y + 8;

    while (m.hp > 0 && S.hp > 0) {
        const res = await LV.Quiz.ask({
            title: isBoss ? '👑 BOSS BATTLE' : '⚔ MONSTER BATTLE',
            sub: `${d.name} — jawab benar untuk menyerang!`,
            duel: duel(),
            onAnswer: r => {
                if (r.ok) { m.hp--; LV.Quiz.animate('p'); }
                else { S.hurt(d.dmg); LV.Quiz.animate('m'); }
                LV.Quiz.setDuel(duel());
            }
        });
        LV.Quiz.fx(res, cx, cy);
    }

    if (m.hp <= 0) {
        m.alive = false; S.done[m.key] = true;
        const c = S.addCoins(d.coins);
        S.rewards.push(`${d.name} dikalahkan (+${c} koin)`);
        LV.FX.burst(cx, cy + 10, '#ffffff', 24, 140, 80, 4);
        LV.FX.text(cx, cy - 8, '+' + c + ' KOIN', '#ffd84a');
        LV.Audio.play('coin');
    }
};
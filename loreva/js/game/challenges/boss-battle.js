LV.Challenges = LV.Challenges || {};

LV.Challenges.boss = async function (b) {
    const d = LV.Monsters.types[b.kind];
    await LV.HUD.banner('⚠ BOSS ⚠', d.name);
    await LV.Challenges.battle(b, true);
};
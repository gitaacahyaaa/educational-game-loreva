// Legenda: # pohon | . rumput | , bunga | = jalan | ~ air
//          P awal | M monster | B boss | C peti | Z puzzle | D gerbang soal
LV.Levels = LV.Levels || {};

LV.Levels[1] = {
    id: 1,
    name: 'Forest of Knowledge',
    theme: 'forest',
    intro: 'Hutan kuno menyimpan rahasia angka. Buka gerbangnya dan kalahkan Treant!',
    monsters: ['slime', 'mushroom', 'slime'],
    boss: 'treant',
    map: [
        '####################',
        '#.,.......#...,....#',
        '#.M.......#......,.#',
        '#...,.#...#.,....B.#',
        '#......~~.#........#',
        '#.......~.#.....Z..#',
        '#=========D========#',
        '#,........#.......,#',
        '#.....M...#........#',
        '#...,.#...#..M.,...#',
        '#.......C.#.....#..#',
        '#,.......,#....,...#',
        '#.P.......#........#',
        '####################'
    ]
};
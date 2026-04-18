// Rescore all 100 finishers using the rubric in .rubric.md
// Usage: node scripts/rescore.js

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'finishers.json');

// scoring map: id -> [coolness, impact, iconic]
// Calibrated per rubric:
//   coolness: 95-100 ポスター級 / 85-94 独自演出確立 / 70-84 標準的決め技 / 55-69 平均 / 40-54 地味
//   impact:   95-100 地形破壊・完全決着 / 85-94 ラスボス級 / 70-84 主要試合決定 / 55-69 中ボス級 / 40-54 平均
//   iconic:   95-100 国民的 / 85-94 作品ファン100% / 70-84 ジャンルファン / 55-69 固有ファン層 / 40-54 マニア
//
// 同シリーズの代表技ヒエラルキー:
//   ドラゴンボール: かめはめ波(100) > 元気玉(86) > 魔貫光殺砲(80) > 太陽拳(78) > 気円斬(76) > ファイナルフラッシュ(72) > ビッグバンアタック(70)
//   NARUTO: 螺旋丸(96) > 千鳥(90) > 影分身扱い無し → 螺旋手裏剣(82) > 須佐能乎(80) > 神威(74) > 天照(72) > 八門(74) > 木ノ葉旋風(58)
//   BLEACH: 月牙天衝(94) > 天鎖斬月(82) > 千本桜(78) > 鏡花水月(76) > 虚閃(74) > 完全催眠(70) > 黒棺(58)
//   ONE PIECE: ゴムゴムの猿王銃(82) > 鬼斬り(78) > 三・千・世・界(76) > レッドホーク(76) > ディアブルジャンブ(74) > 神避(60)
//   呪術廻戦: 無量空処(86) > 黒閃(80) > 虚式茈(78) > 極ノ番うずまき(64) > 簡易領域(58)
//   仮面ライダー: ライダーキック(98) > ライダーパンチ(80) > クリムゾンスマッシュ(74) > クロックアップ(72) > ジョーカーエクストリーム(70) > 龍騎(64) > ゼロワン(60)
//   ウルトラマン: スペシウム光線(98) > エメリウム光線(82) > ゼペリオン(76) > M87(72) > レオキック(70)

const scores = {
  // ===== TIER S: 国民的・絶対的代名詞 =====
  'db-kamehameha':                  [98, 96, 100], // かめはめ波 - 最強の国民的認知
  'kamen-rider-rider-kick':         [92, 90, 98],  // ライダーキック - 国民的
  'ultraman-specium-ray':           [90, 92, 98],  // スペシウム光線 - 国民的
  'sf-shoryuken':                   [93, 84, 96],  // 昇龍拳 - 格ゲー代名詞、国民的
  'naruto-rasengan':                [92, 90, 96],  // 螺旋丸 - NARUTO看板
  'bleach-getsuga-tensho':          [97, 90, 94],  // 月牙天衝 - BLEACH看板
  'godzilla-atomic-breath':         [94, 96, 96],  // 放射熱線 - ゴジラ象徴・国民的

  // ===== TIER A: 作品代表級・知名度高 =====
  'sf-hadoken':                     [82, 76, 95],  // 波動拳 - 格ゲー定番代名詞
  'pokemon-thunderbolt':            [76, 78, 94],  // 10まんボルト - ポケモン代名詞
  'jojo-the-world-time-stop':       [97, 92, 92],  // ザ・ワールド時止め - JOJO象徴
  'sf-shun-goku-satsu':             [94, 90, 92],  // 瞬獄殺 - 演出名作
  'sailormoon-tiara-action':        [82, 76, 92],  // ティアラ・アクション - 国民的アニメ代名詞
  'jjk-domain-unlimited-void':      [99, 95, 88],  // 無量空処 - 呪術看板演出
  'sf-sonic-boom':                  [76, 72, 90],  // ソニックブーム - ガイル代名詞
  'jojo-star-platinum-the-world':   [95, 90, 90],  // SPザ・ワールド
  'pokemon-hyper-beam':             [80, 88, 90],  // はかいこうせん - 定番
  'db-solar-flare':                 [72, 70, 82],  // 太陽拳 - 派生(かめはめ波>元気玉>魔貫光殺砲>太陽拳)
  'onepiece-king-kong-gun':         [94, 94, 88],  // 猿王銃 - ONE PIECE代表
  'ippo-dempsey-roll':              [92, 90, 90],  // デンプシーロール - はじめの一歩看板
  'smash-falcon-punch':             [85, 82, 90],  // ファルコンパンチ - スマブラ・ミーム
  'naruto-chidori':                 [92, 86, 88],  // 千鳥 - NARUTOライバル技
  'saint-seiya-pegasus-meteor-fist':[88, 82, 90],  // ペガサス流星拳 - 聖闘士代名詞
  'db-genki-dama':                  [88, 98, 86],  // 元気玉 - 派生だが大技象徴

  // ===== TIER B: 作品ファン100%知名度 =====
  'demon-thunderclap-flash':        [91, 84, 88],  // 霹靂一閃 - 鬼滅看板
  'pokemon-fire-blast':             [78, 84, 87],  // だいもんじ
  'mha-detroit-smash':              [85, 86, 86],  // デトロイトスマッシュ
  'kof-yaotome':                    [96, 88, 84],  // 八稚女 - KOFライバル看板
  'yyh-spirit-gun':                 [84, 80, 88],  // 霊丸 - 幽白代名詞
  'jjk-hollow-purple':              [93, 92, 84],  // 茈 - 派生だが演出強烈
  'snk-rising-tackle':              [78, 76, 88],  // ライジングタックル
  'fma-human-transmutation':        [88, 86, 86],  // 人体錬成 - ハガレン象徴
  'ff7-omnislash':                  [91, 88, 86],  // 超究武神覇斬 - FF7看板
  'gundam-last-shooting':           [92, 86, 88],  // ラストシューティング
  'zelda-spin-attack':              [78, 78, 88],  // 回転斬り
  'demon-hinokami-retsujitsu':      [88, 84, 84],  // ヒノカミ神楽
  'naruto-rasenshuriken':           [90, 92, 86],  // 螺旋手裏剣
  'sf-shinku-hadoken':              [82, 78, 84],  // 真空波動拳
  'kof-hououkyaku':                 [88, 80, 84],  // 鳳凰脚 - 不知火舞
  'ff7-knights-of-round':           [92, 92, 86],  // ナイツオブラウンド
  'naruto-eight-gates':             [94, 92, 84],  // 八門遁甲
  'ultraman-emerium-ray':           [80, 82, 88],  // エメリウム光線
  'precure-marble-screw':           [82, 80, 86],  // マーブル・スクリュー
  'db-special-beam-cannon':         [90, 90, 83],  // 魔貫光殺砲 (元気玉86 > 魔貫83 > 太陽拳82)
  'db-destructo-disc':              [82, 88, 78],  // 気円斬 - クリリン代名詞
  'demon-moon-breathing':           [88, 86, 78],  // 月の呼吸 - 鬼滅上弦壱の専用呼吸

  // ===== TIER B-: 作品ファン認知 =====
  'jjk-black-flash':                [86, 80, 82],  // 黒閃
  'pro-wrestling-rainmaker':        [90, 82, 80],  // レインメーカー
  'kamen-rider-crimson-smash':      [94, 82, 78],  // クリムゾンスマッシュ
  'onepiece-santoryu-sanzen-sekai': [92, 82, 80],  // 三・千・世・界
  'naruto-amaterasu':               [88, 82, 80],  // 天照
  'naruto-susanoo':                 [92, 90, 82],  // 須佐能乎
  'bleach-tensa-zangetsu':          [89, 86, 84],  // 天鎖斬月
  'demon-constant-flux':            [84, 82, 78],  // 生生流転
  'mha-one-for-all-100':            [86, 88, 80],  // OFA 100%
  'onepiece-onigiri':               [82, 80, 80],  // 鬼斬り
  'bleach-cero':                    [82, 86, 82],  // 虚閃
  'onepiece-red-hawk':              [88, 84, 78],  // レッドホーク
  'onepiece-diable-jambe':          [88, 84, 78],  // ディアブルジャンブ
  'ff7-bahamut-zero':               [90, 90, 78],  // テラフレア
  'bleach-senbonzakura-kageyoshi':  [97, 84, 76],  // 千本桜景厳
  'kamen-rider-w-joker-extreme':    [90, 84, 76],  // ジョーカーエクストリーム
  'ultraman-leo-kick':              [86, 82, 82],  // レオキック
  'saint-seiya-diamond-dust':       [86, 80, 82],  // ダイヤモンドダスト
  'jojo-emerald-splash':            [82, 76, 80],  // エメラルドスプラッシュ
  'hxh-jajanken':                   [86, 84, 80],  // ジャジャン拳
  'db-final-flash':                 [90, 84, 76],  // ファイナルフラッシュ
  'naruto-kamui':                   [88, 86, 78],  // 神威
  'kamen-rider-clock-up':           [90, 72, 74],  // クロックアップ
  'aot-thunder-spear':              [82, 86, 76],  // 雷槍

  // ===== TIER C: ジャンルファン認知 =====
  'yyh-darkness-flame':             [94, 86, 78],  // 邪王炎殺黒龍波
  'kamen-rider-rider-punch':        [78, 78, 80],  // ライダーパンチ
  'naruto-leaf-whirlwind':          [78, 74, 76],  // 木ノ葉旋風
  'ultraman-zeperion-ray':          [84, 80, 76],  // ゼペリオン光線
  'ultraman-m87-ray':               [76, 78, 74],  // M87光線
  'saint-seiya-aurora-execution':   [92, 86, 76],  // オーロラエクスキューション
  'saint-seiya-lightning-plasma':   [86, 82, 70],  // ライトニングプラズマ
  'bleach-kyoka-suigetsu':          [86, 86, 80],  // 鏡花水月
  'bleach-kanzen-saimin':           [85, 84, 78],  // 完全催眠
  'fairy-tail-dragon-slayer-magic': [84, 82, 76],  // 滅竜魔法
  'gundam-atomic-bazooka':          [86, 92, 70],  // アトミックバズーカ
  'kof-raging-storm':               [86, 76, 72],  // レイジングストーム
  'pro-wrestling-shining-wizard':   [86, 72, 76],  // シャイニング・ウィザード
  'sf-messatsu-gohado':             [86, 82, 78],  // 滅殺豪波動
  'snk-rock-howard-shine-knuckle':  [82, 78, 64],  // シャインナックル
  'kamen-rider-zero-one-rising-impact': [86, 86, 70], // ライジングインパクト
  'kamen-rider-dragon-rider-kick':  [86, 88, 72],  // ドラゴンライダーキック
  'precure-gold-forte-burst':       [82, 80, 68],  // ゴールド・フォルテ・バースト
  'smash-fox-landmaster':           [80, 82, 74],  // ランドマスター
  'zelda-ending-blow':              [82, 82, 70],  // とどめの一撃
  'db-big-bang-attack':             [85, 86, 76],  // ビッグバンアタック
  'jjk-maximum-uzumaki':            [84, 86, 70],  // 極ノ番うずまき
  'bleach-kurohitsugi':             [93, 78, 64],  // 黒棺
  'onepiece-kamusari':              [88, 82, 72],  // 神避
  'jjk-simple-domain':              [76, 78, 64],  // 簡易領域

  // ===== TIER D: combat_sports + マニア向け =====
  'pro-wrestling-western-lariat':   [76, 84, 70],  // ウエスタン・ラリアット
  'combat-german-suplex':           [76, 84, 82],  // ジャーマンスープレックス - 一般認知高
  'combat-dropkick':                [75, 80, 84],  // ドロップキック - 一般認知高
  'combat-juji-gatame':             [60, 78, 70],  // 腕ひしぎ十字固め - 一般認知中
  'combat-triangle-choke':          [58, 76, 60],  // 三角絞め - 一般認知中
  'combat-high-kick':               [70, 82, 72],  // ハイキック - 一般認知
};

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Sanity: check all ids covered
const missing = data.filter(d => !(d.id in scores));
if (missing.length) {
  console.error('Missing scores for:', missing.map(d => d.id));
  process.exit(1);
}
const extra = Object.keys(scores).filter(id => !data.find(d => d.id === id));
if (extra.length) {
  console.error('Extra ids in scores not in data:', extra);
  process.exit(1);
}

// Apply scores and compute total
for (const entry of data) {
  const [c, i, ic] = scores[entry.id];
  entry.coolness_score = c;
  entry.impact_score = i;
  entry.iconic_score = ic;
  entry.score = Math.round(c * 0.35 + i * 0.25 + ic * 0.40);
}

// Sort by score desc, tiebreak by iconic desc
data.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  return b.iconic_score - a.iconic_score;
});

// Reassign rank
data.forEach((d, idx) => { d.rank = idx + 1; });

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');

// Report
console.log('=== Top 10 ===');
data.slice(0, 10).forEach(d => {
  console.log(`${String(d.rank).padStart(3)} | ${d.score} | c${d.coolness_score} i${d.impact_score} ic${d.iconic_score} | ${d.name} (${d.character})`);
});
console.log('\n=== Bottom 5 ===');
data.slice(-5).forEach(d => {
  console.log(`${String(d.rank).padStart(3)} | ${d.score} | c${d.coolness_score} i${d.impact_score} ic${d.iconic_score} | ${d.name} (${d.character})`);
});

console.log('\nTotal entries:', data.length);
const ranks = data.map(x => x.rank).sort((a, b) => a - b);
console.log('rank 1:', ranks[0], 'rank 100:', ranks[99]);
console.log('contiguous:', ranks.every((r, i) => r === i + 1));

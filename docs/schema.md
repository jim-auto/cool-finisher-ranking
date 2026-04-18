# JSON スキーマ説明

`data/finishers.json` は、必殺技データの配列です。MVP では厳密な JSON Schema ファイルは置かず、AI や人間が編集しやすいようにシンプルなフィールド定義で運用します。

## データ例

```json
{
  "id": "db-kamehameha",
  "rank": 1,
  "name": "かめはめ波",
  "series": "ドラゴンボール",
  "character": "孫悟空",
  "category": "anime",
  "genre": "beam",
  "score": 99,
  "coolness_score": 98,
  "impact_score": 99,
  "iconic_score": 100,
  "description": "両手に気を集めて放つ、必殺技の代名詞ともいえる青い一撃。",
  "tags": ["気功波", "主人公", "超定番"]
}
```

## フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | yes | 一意なID。英数字、ハイフン、アンダースコアを推奨します。 |
| `rank` | number | yes | 初期順位。表示やタイブレークに使います。 |
| `name` | string | yes | 必殺技名。 |
| `series` | string | yes | 作品名、団体名、競技名など。 |
| `character` | string | yes | 使用キャラ、選手、または技の代表的な使い手。 |
| `category` | string | yes | 作品カテゴリ。例: `anime`, `game`, `tokusatsu`, `combat_sports`。 |
| `genre` | string | yes | 技の系統。例: `beam`, `slash`, `punch`, `kick`, `transformation`, `grappling`, `special`。 |
| `score` | number | yes | 総合スコア。初期表示はこの値の降順です。 |
| `coolness_score` | number | yes | かっこよさの内訳スコア。0 から 100 を推奨します。 |
| `impact_score` | number | yes | 演出、破壊力、試合展開への影響などの内訳スコア。0 から 100 を推奨します。 |
| `iconic_score` | number | yes | 知名度や象徴性の内訳スコア。0 から 100 を推奨します。 |
| `description` | string | yes | 一覧カードに表示する短い説明文。オリジナル文で簡潔に書きます。 |
| `tags` | string[] | yes | 表示用タグ。検索対象にはしていませんが、将来のタグ検索に使えます。 |

## category の運用

MVP では次の値を使っています。

| 値 | 表示名 |
| --- | --- |
| `anime` | アニメ |
| `game` | ゲーム |
| `tokusatsu` | 特撮 |
| `combat_sports` | プロレス / 格闘技 |

新しいカテゴリを追加しても画面には表示されます。ただし、読みやすい日本語ラベルを付けたい場合は `script.js` の `categoryLabels` に追記してください。

## genre の運用

MVP では次の値を使っています。

| 値 | 表示名 |
| --- | --- |
| `beam` | 光線 / 気功 |
| `slash` | 斬撃 |
| `punch` | パンチ |
| `kick` | キック |
| `transformation` | 変身 / 強化 |
| `grappling` | 組み技 |
| `throw` | 投げ |
| `special` | 特殊技 |

ジャンルは自由に増やせます。日本語ラベルを付けたい場合は `script.js` の `genreLabels` に追記してください。

## 編集ルール

- `id` は重複させない。
- `rank` は整数を推奨する。
- スコア系の値は 0 から 100 の範囲にする。
- `description` は短く、公式文や他サイト本文のコピーを避ける。
- `tags` は 2 から 5 個程度に抑える。
- データを追加したら JSON と画面表示を確認する。

## 将来の拡張候補フィールド

| フィールド | 用途 |
| --- | --- |
| `aliases` | 別名や表記揺れ検索。 |
| `debut_year` | 初登場年でのフィルタや年表表示。 |
| `source_type` | 漫画、アニメ、ゲーム、実写、試合などの細分化。 |
| `power_type` | 炎、雷、光、物理、関節などの属性分類。 |
| `detail_url` | 詳細ページや外部参照へのリンク。 |
| `votes` | 投票機能の集計値。 |

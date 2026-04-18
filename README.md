# cool-finisher-ranking

アニメ、ゲーム、特撮、プロレス / 格闘技などに登場する「かっこいい必殺技」を集め、ランキング形式で眺めるための小さな静的Webサイトです。

MVPではビルド不要の HTML / CSS / JavaScript だけで構成し、GitHub Pages にそのまま公開できることを優先しています。UI とデータは分離しており、ランキングデータは `data/finishers.json` に集約しています。

## スクリーンショット

ここにトップページやカード一覧のスクリーンショットを追加します。

## セットアップ

このリポジトリをクローンします。

```bash
git clone https://github.com/<your-name>/cool-finisher-ranking.git
cd cool-finisher-ranking
```

ローカルで確認する場合は、任意の静的サーバーを使います。Python が使える環境なら次のコマンドで起動できます。

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いて確認します。

## GitHub Pages での公開方法

1. GitHub で `cool-finisher-ranking` リポジトリを作成します。
2. このリポジトリの内容を `main` ブランチに push します。
3. GitHub のリポジトリ画面で `Settings` を開きます。
4. `Pages` の `Build and deployment` で `Deploy from a branch` を選び、`main` ブランチの `/root` を指定します。
5. 表示された GitHub Pages の URL にアクセスして公開状態を確認します。

## データ追加方法

必殺技データは `data/finishers.json` に配列で定義します。新しいデータを追加すると、カテゴリやジャンルのフィルタ選択肢は JavaScript 側で自動生成されます。

最低限、次のフィールドを持たせます。

```json
{
  "id": "unique-finisher-id",
  "rank": 1,
  "name": "技名",
  "series": "作品名",
  "character": "使用キャラ",
  "category": "anime",
  "genre": "beam",
  "score": 99,
  "coolness_score": 98,
  "impact_score": 99,
  "iconic_score": 100,
  "description": "短いオリジナル説明文",
  "tags": ["タグ1", "タグ2"]
}
```

`id` は重複しない英数字ベースの文字列にしてください。説明文は短くオリジナルにまとめ、作品本文や公式説明の長い引用は避けます。

詳しいデータ仕様は [docs/schema.md](docs/schema.md) を参照してください。

## 主な機能

- `score` 降順の初期ランキング表示
- ジャンルフィルタ
- 作品カテゴリフィルタ
- 技名・作品名・キャラ名の検索
- スコア順、名前順、初期順位順のソート
- 空検索結果メッセージ
- スマホ対応のカードレイアウト

## 今後の拡張案

- 投票機能
- お気に入り保存
- 詳細ページ
- 技の系統マップ
- キャラ別ランキング
- 作品別ランキング
- SNS シェア
- データ投稿フォーム
- 「現実で真似したい技ランキング」のような派生企画

より詳しいアイデアは [docs/ideas.md](docs/ideas.md) にまとめています。

## 構成

```text
.
├── index.html
├── styles.css
├── script.js
├── data/
│   └── finishers.json
├── docs/
│   ├── ideas.md
│   └── schema.md
└── README.md
```

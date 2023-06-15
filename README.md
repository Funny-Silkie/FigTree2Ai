# FigTree2Ai

[FigTree](http://tree.bio.ed.ac.uk/software/figtree/)の吐き出したPDFファイルをイラレ（[Adobe Illustrator](https://www.adobe.com/jp/)）で扱えるように整形します。

## 何をやってくれる？

1. スケールバーの文字+バーをレイヤー「Scale Bar」にグループ化して移動
1. 初期レイヤーにある謎の外枠を削除
1. 全ての枝を縦棒と横棒に分割してレイヤー「Nodes」に移動
1. ルートを削除

## 使い方

1. FigTreeのエクスポート機能でPDFを出力
1. イラレで当該PDFファイルを開く
1. クリッピングマスクの解除を2回行う
1. イラレの「ファイル>スクリプト>その他のスクリプト」でファイル選択画面に遷移，`init_tree.js` を実行

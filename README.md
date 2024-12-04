## ローカル実行

### 環境変数定義
```
.env.exampleを.env.localにコピーして、ファイル中の変数値を適当に変更する
```
### パッケージインストール
```
npm install
```
### 実行
```
npm run dev
```
### ビルド
```
npm run build
```
### イメージ作成
```
# ./jenkins.sh  package.jsonに定義されているversionに基づいて"schedule-[version]"をレポジトリへ生成する
# ./jenkins.sh x.y.z  versionを指定して"schedule-x.y.z"をレポジトリへ生成する
```
### k8sデプロイ
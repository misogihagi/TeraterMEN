# teraterMENとは
teraterMENは[teraterm](https://ja.osdn.net/projects/ttssh2/)をもとにしたターミナルエミュレーターです。

# インストール
```bash
git clone https://github.com/misogihagi/TeraterMEN.git
npm i
```
# 使い方
```
node server/dist/express
```
で
http://localhost:3000/#ssh://user:pass@localhost:22
にアクセスすれば自分のsshサーバーにアクセスするはず。

# ライセンス
MITかなあ?

# 免債
svelteのアイコンそのままつかっちった
あとURLの中にパスワード入れたり、SSHのなりすましとか起きても無視するから全然セキュアじゃないよ!

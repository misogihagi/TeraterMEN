[![Maintainability](https://api.codeclimate.com/v1/badges/d44bc114e561f290968b/maintainability)](https://codeclimate.com/github/misogihagi/TeraterMEN/maintainability)
[![CodefactorC Status](https://www.codefactor.io/repository/github/misogihagi/Teratermen/badge?style=plastic)](https://www.codefactor.io/repository/github/misogihagi/teratermen/)
[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=misogihagi_TeraterMEN&metric=alert_status)](https://sonarcloud.io/dashboard?id=misogihagi_TeraterMEN)

# teraterMENとは
teraterMENは[teraterm](https://ja.osdn.net/projects/ttssh2/)をもとにしたターミナルエミュレーターです。

# インストール
```bash
git clone https://github.com/misogihagi/TeraterMEN.git
npm install
npm run build
npm start
```
# 使い方
```
node server/dist/express
```
で
http://localhost:3000/#ssh://user:pass@localhost:22
にアクセスすれば自分のsshサーバーにアクセスするはず。
.envをelectronにしたりgulpにelectronと渡せばelectronで起動(してくれ)

# ライセンス
MITかなあ?

# 免債
svelteのアイコンそのままつかっちった
あとURLの中にパスワード入れたり、SSHのなりすましとか起きても無視するから全然セキュアじゃないよ!

# recipeSite

## ローカル開発（Docker Compose）

フロントエンドとバックエンドをローカルで同時に起動。

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

フロントエンドは `docker-compose.yml` 内で `NEXT_PUBLIC_API_URL=http://localhost:8000` を使用する。
バックエンドはローカルでは `PORT=8000` で待ち受け、Cloud Run では `PORT` が自動で注入される。

## Cloud Build

このリポジトリでは、バックエンドとフロントエンドで Dockerfile を分けている。
Google Cloud Build でビルドする際は、正しいディレクトリで実行されるように config ファイルを指定すること。

### バックエンドイメージをビルド

```bash
gcloud builds submit --config cloudbuild.backend.yaml
```

### フロントエンドイメージをビルド

```bash
gcloud builds submit \
	--config cloudbuild.frontend.yaml \
	--substitutions=_NEXT_PUBLIC_API_URL=https://recipe-backend-260406080055.asia-northeast1.run.app
```

`--tag` モードは自動生成されたビルドテンプレートを使うため、`_NEXT_PUBLIC_API_URL` のようなカスタム置換は受け付けらない。

`cloudbuild.frontend.yaml` はイメージタグに `$BUILD_ID` を使用しているため、手動の `gcloud builds submit` 実行時でも有効なタグが付く。
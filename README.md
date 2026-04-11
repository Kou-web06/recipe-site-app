# recipeSite

## Cloud Build

This repository has separate Dockerfiles for backend and frontend.
When building on Google Cloud Build, specify the config file so the build runs in the correct directory.

### Build backend image

```bash
gcloud builds submit --config cloudbuild.backend.yaml
```

### Build frontend image

```bash
gcloud builds submit \
	--config cloudbuild.frontend.yaml \
	--substitutions=_NEXT_PUBLIC_API_URL=https://recipe-backend-260406080055.asia-northeast1.run.app
```

`--tag` mode uses an auto-generated build template, so custom substitutions such as `_NEXT_PUBLIC_API_URL` are not accepted there.

`cloudbuild.frontend.yaml` uses `$BUILD_ID` as the image tag so manual `gcloud builds submit` runs also get a valid tag.
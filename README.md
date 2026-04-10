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
gcloud builds submit --config cloudbuild.frontend.yaml
```
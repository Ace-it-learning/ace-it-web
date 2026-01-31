# Google Cloud Setup & Configuration

**Project ID**: `ace-it-learning`
**Region**: `asia-east2` (Hong Kong) - *Recommended for latency*

## Setup Log
- [x] Verified `gcloud` installation.
- [x] Authenticated user.
- [x] Identified Project ID.

## Essential Commands

### Enable Services
```bash
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    firestore.googleapis.com
```

### Set Default Project
```bash
gcloud config set project ace-it-learning
```

### Backend Deployment (Cloud Run)
```bash
gcloud run deploy ace-it-backend \
  --source . \
  --region asia-east2 \
  --allow-unauthenticated
```

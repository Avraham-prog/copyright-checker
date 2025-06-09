diff --git a/README.md b/README.md
index 6a5051e663e41d0e93e2adb997c4645c0f7c1a5c..3ae11c5b54147fa85e2fee6e0458e388a922e072 100644
--- a/README.md
 b/README.md
@@ -1 1,51 @@
-# copyright-checker
# Copyright Checker

## Overview

Copyright Checker is a Next.js application paired with a small Express API. It allows you to upload files or provide media URLs and receives an AI generated legal summary about potential copyright and trademark issues.

## Setup

1. Install dependencies for the Next.js app:

```bash
npm install
```

2. Install and start the API server:

```bash
cd server
npm install
npm start
```

The server listens on `PORT` (defaults to `3001`).

3. In another terminal, from the project root start the Next.js dev server:

```bash
npm run dev
```

Visit `http://localhost:3000` to open the app.

## Usage

Upload an image or enter a URL in the interface. The application sends the data to the Express server, which calls OpenAI and returns a legal analysis.

## Environment Variables

Copy `.env.example` to `.env` in the project root and `server/.env.example` to `server/.env`. The following variables are required:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` – your Cloudinary cloud name.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` – Cloudinary upload preset for unsigned uploads.
- `NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL` – URL of the legal assistant endpoint (e.g. `http://localhost:3001/legal-assistant`).
- `NEXT_PUBLIC_LEGAL_ANALYSIS_API_KEY` – optional API key for the legal assistant.
- `OPENAI_API_KEY` – OpenAI API key used by the server.
- `PORT` – port for the Express server (default `3001`).
- `ACRCLOUD_ACCESS_KEY` – ACRCloud access key for audio analysis.
- `ACRCLOUD_SECRET_KEY` – ACRCloud secret key.
- `ACRCLOUD_HOST` – ACRCloud host URL.

Make sure these variables are set before running the application.

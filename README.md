# Salamander Project

React/Vite frontend for previewing salamander videos, tuning color-threshold detection, and sending videos to a backend centroid processor.

## Current Capabilities

- Upload a local video file from the Videos page.
- Show an uploaded-video preview immediately in the browser using a local object URL.
- Capture a frame from the uploaded video and render a binarized test image on a canvas.
- Tune the target color and threshold before submitting the processing job.
- Submit the selected file to the backend `POST /api/videos/centroids` endpoint as `multipart/form-data`.
- Display the returned `jobId`, server CSV path, and CSV download link.
- Browse mock "Available Videos" and open a preview page for thumbnail-based binarization testing.
- Deploy under the `/salamander/` base path for GitHub Pages.

## Architecture

This repository is currently the frontend application. It expects a companion backend server to be running separately.

```text
Browser
  |
  | React + Vite frontend
  | - file upload form
  | - local video preview
  | - canvas binarization test
  |
  | multipart/form-data
  v
Express backend on port 8080
  |
  | runs Java video processor
  v
CSV centroid result
```

### Frontend

- `src/main.jsx` mounts the React app and configures `BrowserRouter` with `import.meta.env.BASE_URL`.
- `src/App.jsx` defines the main routes:
  - `/` -> dashboard home
  - `/videos` -> upload, preview, binarization, backend submission
  - `/preview/:filename` -> mock thumbnail preview and binarization
- `src/pages/Videos.jsx` is the main workflow page. It handles local file selection, uploaded-video preview, threshold controls, backend submission, and result display.
- `src/pages/Preview.jsx` supports the older mock-video thumbnail preview flow.
- `src/utils/binarize.js` contains the shared RGB thresholding and canvas drawing logic used by both uploaded videos and mock thumbnails.
- `src/api/videoProcessing.js` contains the backend API call.
- `src/mockApi.js` is still used for the mock "Available Videos" list and thumbnail examples.

### Backend Contract

The frontend expects this backend endpoint:

```http
POST http://localhost:8080/api/videos/centroids
Content-Type: multipart/form-data
```

Form fields:

- `file`: selected video file
- `targetColor`: six-character hex color without `#`, for example `00FF00`
- `threshold`: non-negative integer threshold

Expected JSON response:

```json
{
  "jobId": "uuid",
  "outputCsv": "/absolute/or/server/path/to/result.csv",
  "downloadPath": "/api/videos/results/uuid"
}
```

The frontend turns `downloadPath` into a full download URL using the configured backend base URL.

The backend also needs:

```http
GET http://localhost:8080/api/videos/results/:jobId
```

That route should download the generated CSV.

## CORS

The frontend and backend run on different ports during local development, so the backend must allow CORS from the Vite dev server.

Example backend setup:

```js
import cors from 'cors';

app.use(cors({
  origin: ['http://127.0.0.1:5173', 'http://localhost:5173']
}));
```

## Configuration

The backend base URL defaults to:

```text
http://localhost:8080
```

To override it, create `.env.local` in the project root:

```bash
VITE_VIDEO_API_BASE_URL=http://localhost:8080
```

Vite only exposes environment variables that start with `VITE_`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the app at the Vite URL. With the current Vite base path, the local app is usually available at:

```text
http://localhost:5173/salamander/
```

The backend must be running separately on port `8080` unless `VITE_VIDEO_API_BASE_URL` points somewhere else.

## Validation

Run a production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Deployment

The project is configured for GitHub Pages with:

```js
base: '/salamander/'
```

Deploy with:

```bash
npm run deploy
```

The frontend can be deployed statically, but video processing still requires a running backend API.

## Notes

- Uploaded video previews happen entirely in the browser and do not require the backend.
- Binarized test images are for visual threshold tuning before backend processing.
- The mock "Available Videos" section does not currently come from the backend.
- The CSV result only exists after the backend finishes running the video processor.

# Interactive Camera Photobooth

A production-ready browser photobooth built with Next.js, React, TypeScript, Tailwind CSS, Canvas, webcam capture, and TensorFlow hand tracking.

## Features

- Webcam permission flow, live preview, camera switching, countdown capture, retake/clear controls
- Browser-only image processing; no backend or uploaded photos
- TensorFlow hand tracking with graceful manual fallback
- Gestures: open palm starts countdown, peace sign captures, swipe left/right cycles filters
- Canvas editor with square, portrait, story, landscape, A4, and classic strip sizes
- Collage layouts: 2-photo strip, 3-photo strip, 4-photo grid, 6-photo collage
- Frames, background swatches, stickers, captions, grayscale, sepia, brightness, contrast, and vintage filters
- PNG and JPG export

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Webcam APIs require `localhost` or HTTPS.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploying on Vercel

This app uses only browser APIs and Next.js static rendering, so it can be deployed directly to Vercel. The webcam and hand-tracking features run in the client browser after permission is granted.

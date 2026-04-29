# BPO Interview Simulator

A web-based interview practice app for beginners preparing for BPO and call center interviews. The MVP uses static interview questions, browser voice tools, Firebase user accounts, Firestore session history, and Firebase Storage recording uploads.

Follow CipherGuardph: https://www.facebook.com/Cipherguardph

## Technology Stack

- React 18 for the user interface
- Vite 6 for local development and production builds
- React Router 6 for page routing and protected routes
- Firebase Authentication for email/password sign up and login
- Cloud Firestore for users, practice sessions, and answer metadata
- Firebase Storage for recorded audio files
- Browser SpeechSynthesis API for question voice playback
- Browser MediaRecorder API for microphone recording
- Browser MediaDevices API for microphone permission prompts
- CSS custom properties and responsive CSS for the dark mobile-first UI
- ESLint 9 with React and React Hooks lint rules
- Cloudflare Pages-compatible static build output

## Core Features

- Email/password authentication
- Protected dashboard, practice, and history pages
- One-question-at-a-time interview simulator
- Text-to-speech question playback
- 90-second countdown timer with progress bar
- Microphone recording with permission and unsupported-browser handling
- Firebase Storage upload for answer recordings
- Firestore records for sessions and answers
- Suggested answers, speaking structure, tips, and common mistakes
- Session history with recordings and summary metrics
- Static local seed questions that can later move to Firestore

## Firebase Services

This project is configured for Firebase project:

```txt
callcenter-app-4e7ca
```

Firebase files in this repo:

- `.firebaserc` maps the default Firebase project
- `firebase.json` points to Firestore and Storage rules/indexes
- `firestore.rules` protects user and session documents
- `firestore.indexes.json` adds the sessions query index
- `storage.rules` protects recording uploads and playback
- `firebase-security-rules.md` documents the rules example

## Environment Variables

Create `.env.local` for local development. Do not commit `.env.local`.

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=callcenter-app-4e7ca.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=callcenter-app-4e7ca
VITE_FIREBASE_STORAGE_BUCKET=callcenter-app-4e7ca.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=460359180130
VITE_FIREBASE_APP_ID=your-firebase-web-app-id
```

For Cloudflare Pages, add the same variables in the project environment variable settings.

## Data Model

```txt
users/{uid}
sessions/{sessionId}
sessions/{sessionId}/answers/{answerId}
interview-recordings/{uid}/{sessionId}/{questionId}.webm
```

## Local Development

```bash
npm install
npm run dev
```

Default local URL:

```txt
http://127.0.0.1:5173
```

## Build And Validation

```bash
npm run lint
npm run build
```

Build output directory:

```txt
dist
```

## Deployment Notes

Cloudflare Pages settings:

```txt
Build command: npm run build
Build output directory: dist
Root directory: /
```

Firebase setup requirements:

- Enable Firebase Authentication
- Enable Email/Password sign-in
- Enable Cloud Firestore
- Enable Firebase Storage
- Add production and preview deployment domains to Firebase Auth authorized domains
- Deploy Firestore rules, indexes, and Storage rules when they change

## Browser Support Notes

Voice playback depends on `window.speechSynthesis`.

Recording depends on:

- `navigator.mediaDevices.getUserMedia`
- `MediaRecorder`

Some browsers produce microphone recordings as `audio/webm;codecs=opus` or `video/webm;codecs=opus`. The app normalizes supported WebM recordings before upload.

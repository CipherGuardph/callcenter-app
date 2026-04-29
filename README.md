# BPO Interview Simulator

A web-based interview practice app for beginners preparing for BPO and call center interviews. The MVP uses static interview questions, browser voice tools, local browser-cached recordings, a 1-day trial after signup, and optional Firebase account saving at the end of practice.

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
- IndexedDB for local browser-only recording cache before account save
- Firebase Auth trial and subscription state stored in Firestore
- Firebase Storage payment receipt uploads
- CSS custom properties and responsive CSS for the dark mobile-first UI
- ESLint 9 with React and React Hooks lint rules
- Cloudflare Pages-compatible static build output

## Core Features

- Optional email/password authentication at the end of practice
- Public dashboard, practice, and local session summary pages
- Subscription-aware order page with QR-code payment
- Protected cloud history page
- Admin dashboard limited to `cjquintoph@gmail.com`
- One-question-at-a-time interview simulator
- Text-to-speech question playback
- 90-second countdown timer with progress bar
- Microphone recording with permission and unsupported-browser handling
- Local browser cache for answer recordings during practice
- Optional Firebase Storage upload for answer recordings after login
- Optional Firestore records for sessions and answers after login
- Receipt upload with auto-approval for monthly subscription activation
- Automatic trial and subscription expiry prompts
- Best-effort account deletion after the deletion countdown ends
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
- `public/img/` contains the QR code images used on the order page

Practice recordings are not uploaded during the interview. They are cached locally in the user's browser first. On the final session summary, the user can choose to log in and save the completed session to Firebase.
Trial starts on signup and lasts 1 day. After the trial ends, the app routes the user to the order page to upload a receipt and activate the monthly plan.

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
- Use `cjquintoph@gmail.com` as the admin login for the admin dashboard

## Browser Support Notes

Voice playback depends on `window.speechSynthesis`.

Recording depends on:

- `navigator.mediaDevices.getUserMedia`
- `MediaRecorder`

Some browsers produce microphone recordings as `audio/webm;codecs=opus` or `video/webm;codecs=opus`. The app normalizes supported WebM recordings before upload.

Local recordings use IndexedDB and remain tied to the same browser profile. Clearing browser site data can remove unsaved local sessions.

# Firebase Security Rules Example

Use this as a starting point and review it against your real production needs before deploying.

## Firestore

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function ownsUserDoc(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    function isAdmin() {
      return signedIn() && request.auth.token.email == "cjquintoph@gmail.com";
    }

    match /users/{uid} {
      allow read, create, update: if ownsUserDoc(uid) || isAdmin();
      allow delete: if ownsUserDoc(uid) || isAdmin();
    }

    match /sessions/{sessionId} {
      allow create: if signedIn() && request.resource.data.userId == request.auth.uid;
      allow read, update: if signedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if signedIn() && (resource.data.userId == request.auth.uid || isAdmin());

      match /answers/{answerId} {
        allow create: if signedIn()
          && get(/databases/$(database)/documents/sessions/$(sessionId)).data.userId == request.auth.uid;
        allow read, delete: if signedIn()
          && (
            get(/databases/$(database)/documents/sessions/$(sessionId)).data.userId == request.auth.uid
            || isAdmin()
          );
        allow update: if false;
      }
    }
  }
}
```

## Storage

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /interview-recordings/{uid}/{sessionId}/{fileName} {
      allow read: if request.auth != null
        && request.auth.uid == uid;

      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size < 15 * 1024 * 1024
        && request.resource.contentType.matches('audio/.*');
    }

    match /payment-receipts/{uid}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*|application/pdf');
    }
  }
}
```

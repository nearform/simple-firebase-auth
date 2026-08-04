---
"@nearform/simple-firebase-auth-backend": patch
---

Use the modular `firebase-admin/auth` API (`getAuth().verifyIdToken()`) instead of the
legacy namespaced `admin.auth()`. firebase-admin v14 removed the service accessors from the
default export, which broke token verification (`admin.auth is not a function`). This restores
compatibility with firebase-admin v14+ while remaining compatible with v13; the peer-dependency
range is unchanged. Docs updated to the modular `initializeApp` from `firebase-admin/app`.

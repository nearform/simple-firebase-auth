# @nearform/simple-firebase-auth-backend

## 0.1.2

### Patch Changes

- Use the modular `firebase-admin/auth` API (`getAuth().verifyIdToken()`) instead of the ([#22](https://github.com/nearform/simple-firebase-auth/pull/22))
  legacy namespaced `admin.auth()`. firebase-admin v14 removed the service accessors from the
  default export, which broke token verification (`admin.auth is not a function`). This restores
  compatibility with firebase-admin v14+ while remaining compatible with v13; the peer-dependency
  range is unchanged. Docs updated to the modular `initializeApp` from `firebase-admin/app`.

## 0.1.1

### Patch Changes

- Release with provenance. ([#1](https://github.com/nearform/simple-firebase-auth/pull/1))

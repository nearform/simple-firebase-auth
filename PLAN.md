## Plan

We want to create two packages:

- packages/simple-firebase-auth-backend
- packages/simple-firebase-auth-frontend

They are the respective frontend and backend parts of a system to provide simple authentication for a Firebase app that is has static hosting in Firebase and backend Cloud Functions that enforce authentication on routes from the frontend login auth passed on.

I've implemented this twice and now want to abstract just the firebase auth stuff.

Your primary reference is: ../ai-tools-dashboard. In there, look at:

- ../ai-tools-dashboard/frontend/firebase/ for the package packages/simple-firebase-auth-frontend
- ../ai-tools-dashboard/backend/firebase/ for the package packages/simple-firebase-auth-backend

You can also look at an older, less well-organized ../simple-gcp-site project for frontend and backend.

Come up with a full implementation plan of the new packages in this repo.

Various notes:

- The packages can be used alone or together.
- Need to create package.json and all the code for both packages.
- Minimize dependencies everywhere.
- Give guidance to use the frontend package from esm.sh (the other repo examples use this)

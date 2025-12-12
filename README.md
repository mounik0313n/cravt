# clone the git repo
# python -m venv venv (windows)
# venv/Scripts/activate
# python.exe -m pip install --upgrade pip
# install all the requirements.txt by using pip install -r requirements.txt
# using flask run --debug / python app.py 
## Firebase setup (server + frontend)

This project supports Firebase authentication. You must provide both a server-side
service account and a frontend Firebase config object.

Environment variables supported:

- `FIREBASE_SERVICE_ACCOUNT_JSON` — the full Firebase service account JSON as a single-line string (development).
- `FIREBASE_SERVICE_ACCOUNT_FILE` — path to a service account JSON file on the filesystem (recommended for hosting).
- `FIREBASE_FRONTEND_CONFIG_JSON` — the Firebase web app config JSON string used by the frontend to call `firebase.initializeApp()`.

Example `FIREBASE_FRONTEND_CONFIG_JSON` value (replace placeholders):

```json
{"apiKey":"AIzaSyAzaeAJY6yKW4ujOFktp26q-zdt6Wo5hLM","authDomain":"YOUR_PROJECT.firebaseapp.com","projectId":"YOUR_PROJECT","storageBucket":"YOUR_PROJECT.appspot.com","messagingSenderId":"SENDER_ID","appId":"APP_ID"}
```

Local development (PowerShell example):

```powershell
#$env:FIREBASE_SERVICE_ACCOUNT_JSON = '{"type":"service_account", ... }'  # not recommended for production
#$env:FIREBASE_SERVICE_ACCOUNT_FILE = 'C:\path\to\serviceAccount.json'
#$env:FIREBASE_FRONTEND_CONFIG_JSON = '{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}'
# Then start the app
#$env:FLASK_APP='app.py'
#python -m flask run
```

Hosting notes:

- Upload your `serviceAccount.json` to the host (e.g., Render, Fly.io) as a file or secret and set `FIREBASE_SERVICE_ACCOUNT_FILE` to its path.
- Add `FIREBASE_FRONTEND_CONFIG_JSON` in the host's environment variables (do NOT expose the service account JSON to the client).

After setting env vars, restart the app and visit `/login` to test Firebase sign-in.

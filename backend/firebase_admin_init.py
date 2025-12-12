import os
import json
import firebase_admin
from firebase_admin import credentials as firebase_credentials


def init_firebase(app):
    """Initialize Firebase Admin SDK from app config.

    Looks for either FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) or
    FIREBASE_SERVICE_ACCOUNT_FILE (path). This function is idempotent.
    """
    try:
        if firebase_admin._apps:
            app.logger.debug('Firebase Admin already initialized')
            return

        fa_json = app.config.get('FIREBASE_SERVICE_ACCOUNT_JSON')
        fa_file = app.config.get('FIREBASE_SERVICE_ACCOUNT_FILE')

        if fa_json:
            sa_info = json.loads(fa_json)
            cred = firebase_credentials.Certificate(sa_info)
            firebase_admin.initialize_app(cred)
            app.logger.info('Firebase admin initialized from JSON env')
            return

        if fa_file and os.path.exists(fa_file):
            try:
                cred = firebase_credentials.Certificate(fa_file)
                firebase_admin.initialize_app(cred)
                app.logger.info('Firebase admin initialized from file: %s', fa_file)
                return
            except Exception:
                app.logger.exception('Failed to initialize Firebase from file')

        app.logger.info('Firebase service account not provided; Firebase admin not initialized')
    except Exception as e:
        app.logger.warning('Firebase init failed: %s', e)

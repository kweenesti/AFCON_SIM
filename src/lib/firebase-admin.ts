
'use server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = {
  "type": "service_account",
  "project_id": "studio-8231274621-6d57e",
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-mock@studio-8231274621-6d57e.iam.gserviceaccount.com",
  "client_id": "mock_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-mock%40studio-8231274621-6d57e.iam.gserviceaccount.com"
};


export async function initializeAdminApp(): Promise<App> {
    const apps = getApps();
    if (apps.length > 0 && apps.find(app => app?.name === '[DEFAULT]')) {
        return apps.find(app => app?.name === '[DEFAULT]')!;
    }
    
    if (!serviceAccount.private_key) {
        throw new Error('FIREBASE_PRIVATE_KEY is not set in the environment variables.');
    }

    const app = initializeApp({
        credential: cert(serviceAccount)
    });

    return app;
}

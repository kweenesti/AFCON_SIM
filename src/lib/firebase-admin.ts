
'use server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// This is a mock service account key. In a real application, you would
// download this from your Firebase project settings and store it securely.
const serviceAccount = {
  "type": "service_account",
  "project_id": "studio-8231274621-6d57e",
  "private_key_id": "mock_private_key_id",
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
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
    
    // In a real environment, you'd use GOOGLE_APPLICATION_CREDENTIALS
    // but for this context, we explicitly use the service account object.
    const app = initializeApp({
        credential: cert(serviceAccount)
    });

    return app;
}

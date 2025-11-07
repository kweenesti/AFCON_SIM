
'use server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// This function now correctly decodes the base64 private key
const getServiceAccount = () => {
    const privateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64;
    if (!privateKeyB64) {
        throw new Error('FIREBASE_PRIVATE_KEY_B64 is not set in the environment variables.');
    }
    const privateKey = Buffer.from(privateKeyB64, 'base64').toString('utf-8');
    
    return {
      "type": "service_account",
      "project_id": "studio-8231274621-6d57e",
      "private_key": privateKey,
      "client_email": "firebase-adminsdk-mock@studio-8231274621-6d57e.iam.gserviceaccount.com",
      "client_id": "mock_client_id",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-mock%40studio-8231274621-6d57e.iam.gserviceaccount.com"
    };
};


export async function initializeAdminApp(): Promise<App> {
    const apps = getApps();
    if (apps.length > 0 && apps.find(app => app?.name === '[DEFAULT]')) {
        return apps.find(app => app?.name === '[DEFAULT]')!;
    }
    
    const serviceAccount = getServiceAccount();

    const app = initializeApp({
        credential: cert(serviceAccount)
    });

    return app;
}

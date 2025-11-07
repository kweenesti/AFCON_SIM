
'use server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// This function now returns the hardcoded service account object
// to bypass any environment variable loading issues.
const getServiceAccount = () => {
    // IMPORTANT: The private key is hardcoded here to ensure it's correctly formatted.
    const serviceAccount = {
      "type": "service_account",
      "project_id": "studio-8231274621-6d57e",
      "private_key_id": "154f474efe28ebd06b25590fabdc519285c71ab9",
      "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCJrGHhjxVjhEs5\nLxHU9VXvpfo2dRPaBrtNPnpolAaRUc4+nRVBlp8tbHyTvyrJRrowXfqPb3iNm0nQ\nFfxLmlvgUbg1dyi5RCW3JAP3X4w2qDdl48zGns46PZJkEtK8N/iwnM2hCp3aFPXh\ndeNgP5x7LiL8+aBYfXJN/zHSZJJAu25/H2Hx9Fh8bmG5yjMmR9weV5L45PvEFeB4\n0d24X59oh/78PiL0uh0dxhz3eHbAvvb/8kJDmzZ9YJl4yUZMxl2Ooq8mlG5lt5CD\nrtqLMydWylm5gZb4elthu5vnMXkBwDXmtx92nZejsfsVS8UHsOjl/hOXDKULfJMJ\nShWNCxbJAgMBAAECggEADQB4xzHZbfcVMmOigvxFrxn7oExi4UQ7SMDxE+xOFhSy\noV4tBW80pDhEWzqCgqGJcItUYCen+NoLPzm8UUvuh/S5X8jbnmrA4LCbJ6/gQ/WT\nmcdJB3ia9r9QeN8zalW84lN35gQX9hV+efPFhmL4VvfIYFMw4S29VeYw1D/t255u\nBj1XDW99zX0SSsCtW2fXxighdgoToi1Q5jqRIlM0YDqG77yqYs458g79BxSXjzjE\nNB4AtydlW1C4cvraf/9+KhoLz1u2QdQkPFJxV/XWGnGiY7aWdUFuM0bVN2SbIVYv\nQDxvmrM4uIPARfMLeys8VjUqQcpDjjm9psYkIPuPwwKBgQDCjxErhbL/kO3VF4fh\nuWCO1zT0Gix1W1i3ySV7EJ1L1yWUzvOC+ytuaoT4u2uR8cSWkVFX5wzYf7+QAPWf\nJnQ638lHxZ9psgXLoajqHTimQvzz6AxHXVXyPAUT84LvvVbuoRg6P5YrjRI/E8Es\nXBQ/WDFp6RT06UQcGDTkan82QwKBgQC1JnXFLO/b6+q1iAIP8CknmO2FCnWQ0VHm\nlp860OiC81Qt853dSEfT5K4nr3gp6TNF1lWixTaShhYd7PE8U6p9YZS8EQ/aa5nb\n/kHxq5qqoEHBTd79xjRR/RUAYSpQdIXG8kgSQ78kS50VZ7qXWr/HNmw7zMbpk8Zv\ne81OH9d8AwKBgHGmdwYwbJaDh5qhyztdOX1XU1SAcZYATTvWoTFZTDlALXDWz0Kl\nDALM8G4HtVekngzCSH0Lt+JEBZfOJ6zXHrBBh2eIlo18c4w3G9/eP/hHS1IDLCEH\n8au1ydWUutjmhoCQ1AE6obNBDfaQyJfsFdvG3d6bTCWgmau7rDH9z9/XAoGBAJIT\noYSO6Bz/8RTRyFfx4j38JAzUklllchXwABb9v4FZltg3S2XVk5ZbIdT+uneRhbcb\nT5MiVQ9y8QLQvvdWwHS666V8XLxVaIzuS18GcoKFGIE4ukkKO8ahvv2/XM/kJrx3\nQ4b2+nvaPaG1M9I5a8zJJh5S01QnxizAOJ53LtzhAoGALh7Ol30MgKTVsgJ1U8Y+\nrJ1uY6XI9bfZn0F8naXcaiZfausxBvDCxXlKXEC3EZx2fc7roODPEn9zGrinM/BI\njMVXjj2rxIgLaBEjmwDjl3Da4vugm48zUt+sGw+4gG39U0Aj8JPEmfB/j83oG3b7\nPC67RH+Np8+KT7EO6T4WcxE=\n-----END PRIVATE KEY-----\n`,
      "client_email": "firebase-adminsdk-fbsvc@studio-8231274621-6d57e.iam.gserviceaccount.com",
    };
    return serviceAccount;
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

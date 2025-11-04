'use server';

import { getFirestore, collection, query, where, getDocs, writeBatch } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';

export async function grantAdminRole(prevState: any, formData: FormData) {
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return { message: 'Email is required.', success: false };
  }

  try {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { message: `User with email ${email} not found.`, success: false };
    }

    const batch = writeBatch(firestore);
    querySnapshot.forEach((doc) => {
      console.log(`Updating role for user: ${doc.id}`);
      batch.update(doc.ref, { role: 'admin' });
    });

    await batch.commit();

    return { message: `Successfully granted admin role to ${email}.`, success: true };
  } catch (error: any) {
    console.error('Error granting admin role:', error);
    return { message: error.message || 'An unexpected error occurred.', success: false };
  }
}

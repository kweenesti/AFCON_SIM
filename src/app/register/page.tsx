
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  useAuth,
  useFirestore,
  setDocumentNonBlocking,
} from '@/firebase';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [countryName, setCountryName] = useState('');
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  async function handleRegister() {
    if (!name || !email || !password || !countryName) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      if (user) {
        // Create the UserProfile document
        const userProfileRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userProfileRef, {
          id: user.uid,
          displayName: name,
          email: user.email,
          role: 'federation',
        }, { merge: true });

        // Create the Federation document
        const federationRef = doc(firestore, 'federations', user.uid);
        setDocumentNonBlocking(federationRef, {
          representativeName: name,
          representativeEmail: email,
          countryId: countryName,
          countryName: countryName,
          managerName: 'TBD', // Manager is set in the full form
        }, { merge: true });
        
        toast({
          title: 'Registration Successful!',
          description: 'Redirecting to your dashboard...',
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Registration Failed',
        description:
          error.message || 'Could not create your account. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Enter your details to register your federation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="rep@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="federation">Federation / Country</Label>
            <Input
              id="federation"
              placeholder="e.g., Nigeria"
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
            />
          </div>
          <Button onClick={handleRegister} className="w-full" variant="accent">
            Register
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  async function handleRegister() {
    if (!name || !email || !password) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      if (user) {
        const isAdmin = email === 'admin@tournament.com';
        const role = isAdmin ? 'admin' : 'federation';

        // Create the UserProfile document
        const userProfileRef = doc(firestore, 'users', user.uid);
        await setDoc(userProfileRef, {
          id: user.uid,
          displayName: name,
          email: user.email,
          role: role,
        });
        
        if (isAdmin) {
            console.log("Admin account created successfully:", user.email);
        }

        toast({
          title: 'Registration Successful!',
          description: 'Redirecting...',
        });
        
        // After profile is created, redirect.
        if (role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      }
    } catch (error: any)
    {
      console.error(error);
      toast({
        title: 'Registration Failed',
        description:
          error.message || 'Could not create your account. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Enter your details to create an account. Already have one?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
            .
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
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="rep@example.com or admin@tournament.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleRegister} className="w-full" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

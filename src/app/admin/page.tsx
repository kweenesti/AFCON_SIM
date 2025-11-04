'use client';

import { useFormState } from 'react-dom';
import { grantAdminRole } from '@/app/admin/actions';
import { AppShell } from '@/components/layout/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label }s from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function AdminPage() {
  const { toast } = useToast();
  const initialState = { message: '' };
  const [state, dispatch] = useFormState(grantAdminRole, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success!', description: state.message });
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  return (
    <AppShell>
      <main className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              Admin Panel
            </h1>
            <p className="mt-2 text-muted-foreground">
              Grant administrative privileges to a user.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Grant Admin Role</CardTitle>
              <CardDescription>
                Enter the email of the user you want to promote to admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={dispatch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" variant="accent">
                  Make Admin
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

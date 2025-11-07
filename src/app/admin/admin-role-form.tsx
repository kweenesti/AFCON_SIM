
'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { grantAdminRole } from './actions';
import { UserPlus } from 'lucide-react';

const FormSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const initialState = {
    message: '',
    success: false,
};

export function AdminRoleForm() {
  const { toast } = useToast();
  
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const [state, formAction] = useActionState(grantAdminRole, initialState);

  useEffect(() => {
    if (state.message) {
        toast({
            title: state.success ? 'Success!' : 'Error',
            description: state.message,
            variant: state.success ? 'default' : 'destructive',
        });
        if (state.success) {
            form.reset();
        }
    }
  }, [state, toast, form]);


  return (
    <Form {...form}>
      <form action={formAction} onSubmit={form.handleSubmit(() => form.trigger())} className="flex items-end gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>
                User Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="user@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} variant="secondary">
          <UserPlus className="mr-2" />
          {form.formState.isSubmitting ? 'Granting...' : 'Grant Admin Role'}
        </Button>
      </form>
    </Form>
  );
}

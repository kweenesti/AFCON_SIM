
'use client';

import { useActionState } from 'react';
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

export function AdminRoleForm() {
  const { toast } = useToast();
  const [state, dispatch, isPending] = useActionState(grantAdminRole, { message: '', success: false });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    const formData = new FormData();
    formData.append('email', data.email);
    const result = await grantAdminRole(state, formData);

    toast({
        title: result.success ? 'Success!' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
    });

    if(result.success) {
        form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
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
        <Button type="submit" disabled={isPending} variant="secondary">
          <UserPlus className="mr-2" />
          {isPending ? 'Granting...' : 'Grant Admin Role'}
        </Button>
      </form>
    </Form>
  );
}

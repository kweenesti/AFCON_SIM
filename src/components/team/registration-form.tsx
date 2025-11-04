'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import { africanCountries } from '@/lib/countries';
import type { Player, PlayerPosition, Team } from '@/lib/types';
import { playerPositions, PlayerRatings } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ScrollArea } from '../ui/scroll-area';

const playerSchema = z.object({
  name: z.string().min(2, 'Player name must be at least 2 characters.'),
  naturalPosition: z.enum(['GK', 'DF', 'MD', 'AT']),
});

const formSchema = z.object({
  representative: z
    .string()
    .min(2, 'Representative name is required.'),
  country: z.string().min(1, 'Please select a country.'),
  manager: z.string().min(2, 'Manager name is required.'),
  squad: z
    .array(playerSchema)
    .length(23, 'You must have exactly 23 players in the squad.'),
  captainIndex: z.coerce.number().min(0).max(22),
});

type FormData = z.infer<typeof formSchema>;

const SQUAD_SIZE = 23;

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      representative: '',
      country: '',
      manager: '',
      squad: [],
      captainIndex: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'squad',
  });

  const handleNext = async () => {
    const fieldsToValidate =
      step === 1 ? ['representative', 'country'] : ['manager'];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => setStep(step - 1);

  const addPlayer = () => {
    if (fields.length < SQUAD_SIZE) {
      append({ name: '', naturalPosition: 'MD' });
    }
  };

  const generateRatings = (naturalPosition: PlayerPosition): PlayerRatings => {
    const ratings = {} as PlayerRatings;
    playerPositions.forEach((pos) => {
      if (pos === naturalPosition) {
        ratings[pos] = Math.floor(Math.random() * 51) + 50; // 50-100
      } else {
        ratings[pos] = Math.floor(Math.random() * 51); // 0-50
      }
    });
    return ratings;
  };

  const onSubmit = (data: FormData) => {
    const squadWithRatings: Player[] = data.squad.map((p, index) => ({
      id: `${p.name.replace(/\s+/g, '-')}-${index}`,
      name: p.name,
      naturalPosition: p.naturalPosition,
      isCaptain: index === data.captainIndex,
      ratings: generateRatings(p.naturalPosition),
    }));

    const finalTeam: Team = {
      representative: data.representative,
      country: data.country,
      manager: data.manager,
      squad: squadWithRatings,
    };

    try {
      localStorage.setItem('teamData', JSON.stringify(finalTeam));
      toast({
        title: 'Registration Successful!',
        description: `${data.country} has joined the tournament.`,
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description:
          'Could not save your team data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <Progress value={(step / 2) * 100} className="w-full" />
          <span className="text-sm font-medium text-muted-foreground">
            Step {step} of 2
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="representative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Representative Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country to represent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {africanCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pep Guardiola" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Squad ({SQUAD_SIZE} Players)</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addPlayer}
                  disabled={fields.length >= SQUAD_SIZE}
                >
                  <PlusCircle />
                  Add Player
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Controller
                    control={form.control}
                    name="captainIndex"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={String(field.value)}
                        className="space-y-1"
                      >
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">C</TableHead>
                              <TableHead>Player Name</TableHead>
                              <TableHead>Position</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fields.map((field, index) => (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <RadioGroupItem value={String(index)} />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`squad.${index}.name`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            placeholder={`Player ${index + 1}`}
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    control={form.control}
                                    name={`squad.${index}.naturalPosition`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {playerPositions.map((pos) => (
                                              <SelectItem key={pos} value={pos}>
                                                {pos}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 className="text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </RadioGroup>
                    )}
                  />
                  {form.formState.errors.squad && (
                    <p className="p-4 text-sm font-medium text-destructive">
                      {form.formState.errors.squad.message}
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 2 && (
            <Button type="button" variant="accent" onClick={handleNext}>
              Next
              <ArrowRight />
            </Button>
          )}

          {step === 2 && (
            <Button type="submit" variant="accent">
              Register Team
              <Star />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

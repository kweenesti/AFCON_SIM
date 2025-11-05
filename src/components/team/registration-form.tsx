
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
} from 'lucide-react';
import { africanCountries } from '@/lib/countries';
import type { Player, PlayerPosition, Federation } from '@/lib/types';
import { playerPositions } from '@/lib/types';
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
import {
  useAuth,
  useFirestore,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
} from '@/firebase';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, collection } from 'firebase/firestore';
import { generatePlayers, randInt } from '@/lib/generate-players';
import { firstNames, lastNames } from '@/lib/random-names';

const playerSchema = z.object({
  name: z.string().min(2, 'Player name must be at least 2 characters.'),
  naturalPosition: z.enum(['GK', 'DF', 'MD', 'AT']),
});

const formSchema = z.object({
  representativeName: z.string().min(2, 'Representative name is required.'),
  representativeEmail: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  countryName: z.string().min(1, 'Please select a country.'),
  managerName: z.string().min(2, 'Manager name is required.'),
  squad: z
    .array(playerSchema)
    .length(23, 'You must have exactly 23 players in the squad.'),
  captainIndex: z.coerce.number().min(0).max(22),
});

type FormData = z.infer<typeof formSchema>;

const SQUAD_SIZE = 23;

// Helper to generate a random full name
const generateRandomName = () => {
  const firstName = firstNames[randInt(0, firstNames.length - 1)];
  const lastName = lastNames[randInt(0, lastNames.length - 1)];
  return `${firstName} ${lastName}`;
}

const generateInitialSquad = (): { name: string, naturalPosition: PlayerPosition }[] => {
  const squad = [];
  for (let i = 0; i < SQUAD_SIZE; i++) {
    squad.push({
      name: generateRandomName(),
      naturalPosition: playerPositions[randInt(0, playerPositions.length - 1)]
    });
  }
  return squad;
};

// Generate the initial squad data only once.
const initialSquad = generateInitialSquad();


export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      representativeName: '',
      representativeEmail: '',
      password: '',
      countryName: '',
      managerName: '',
      squad: initialSquad, // Use the pre-generated constant squad data
      captainIndex: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'squad',
  });

  const handleNext = async () => {
    const fieldsToValidate =
      step === 1
        ? ['representativeName', 'representativeEmail', 'password', 'countryName']
        : ['managerName'];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => setStep(step - 1);

  const addPlayer = () => {
    if (fields.length < SQUAD_SIZE) {
      append({ name: generateRandomName(), naturalPosition: playerPositions[randInt(0, playerPositions.length - 1)] });
    }
  };

  const generateRatings = (naturalPosition: PlayerPosition) => {
    const ratings: any = {};
    playerPositions.forEach((pos) => {
      const key = `${pos.toLowerCase()}Rating`;
      if (pos === naturalPosition) {
        ratings[key] = randInt(50, 100);
      } else {
        ratings[key] = randInt(0, 50);
      }
    });
    return ratings;
  };

  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.representativeEmail,
        data.password
      );
      const user = userCredential.user;

      if (user) {
        const federationData: Omit<Federation, 'id'> = {
          representativeName: data.representativeName,
          representativeEmail: data.representativeEmail,
          countryId: data.countryName, // Assuming country name is used as ID for simplicity
          countryName: data.countryName,
          managerName: data.managerName,
        };

        const federationRef = doc(firestore, 'federations', user.uid);
        setDocumentNonBlocking(federationRef, federationData, { merge: true });

        const userProfileRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userProfileRef, { 
          id: user.uid,
          email: user.email,
          role: 'federation',
          displayName: data.representativeName,
         }, { merge: true });

        const playersCollectionRef = collection(
          firestore,
          'federations',
          user.uid,
          'players'
        );

        data.squad.forEach((p, index) => {
          const playerData: Omit<Player, 'id'> = {
            federationId: user.uid,
            name: p.name,
            naturalPosition: p.naturalPosition,
            isCaptain: index === data.captainIndex,
            ...generateRatings(p.naturalPosition),
          };
          addDocumentNonBlocking(playersCollectionRef, playerData);
        });

        toast({
          title: 'Registration Successful!',
          description: `${data.countryName} has joined the tournament.`,
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Could not save your team data. Please try again.',
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="representativeName"
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
                name="countryName"
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="representativeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g., rep@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="managerName"
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
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Controller
                    control={form.control}
                    name="captainIndex"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
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

    
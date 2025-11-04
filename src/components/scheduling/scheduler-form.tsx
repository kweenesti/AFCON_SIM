'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Cloud, List, Map, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateSchedule, type SchedulerState } from '@/lib/actions';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const FormSchema = z.object({
  countries: z.string().min(1, 'Please enter at least one country.'),
  tournamentStartDate: z.date({
    required_error: 'A start date is required.',
  }),
  tournamentEndDate: z.date({
    required_error: 'An end date is required.',
  }),
  existingSchedules: z.string().optional(),
  stadiumAvailabilities: z.string().optional(),
  weatherForecasts: z.string().optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export function SchedulerForm() {
  const initialState: SchedulerState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(generateSchedule, initialState);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      countries: '',
      existingSchedules: '',
      stadiumAvailabilities: '',
      weatherForecasts: '',
    },
  });

  const onSubmit = (data: FormSchemaType) => {
    const formData = new FormData();
    formData.append('countries', data.countries);
    formData.append(
      'tournamentStartDate',
      format(data.tournamentStartDate, 'yyyy-MM-dd')
    );
    formData.append(
      'tournamentEndDate',
      format(data.tournamentEndDate, 'yyyy-MM-dd')
    );
    formData.append('existingSchedules', data.existingSchedules || '');
    formData.append('stadiumAvailabilities', data.stadiumAvailabilities || '');
    formData.append('weatherForecasts', data.weatherForecasts || '');
    dispatch(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="countries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Map className="mr-2 inline-block h-4 w-4" />
                  Participating Countries
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Nigeria, Ghana, Egypt"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of countries.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tournamentStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    <CalendarIcon className="mr-2 inline-block h-4 w-4" />
                    Tournament Start Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tournamentEndDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    <CalendarIcon className="mr-2 inline-block h-4 w-4" />
                    Tournament End Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="existingSchedules"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <List className="mr-2 inline-block h-4 w-4" />
                  Existing Schedules
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Country: [Match 1, Match 2]&#10;Nigeria: [vs Brazil on 2024-08-05]&#10;Ghana: [vs Argentina on 2024-08-07]"
                    className="h-32 font-code text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stadiumAvailabilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <MapPin className="mr-2 inline-block h-4 w-4" />
                  Stadium Availabilities
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Stadium Name: [Date 1, Date 2]&#10;Lagos Stadium: [2024-08-10, 2024-08-12]&#10;Accra Stadium: [2024-08-11, 2024-08-13]"
                    className="h-32 font-code text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weatherForecasts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Cloud className="mr-2 inline-block h-4 w-4" />
                  Weather Forecasts
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Location: Forecast&#10;Lagos: Sunny&#10;Accra: Clear skies"
                    className="h-32 font-code text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" variant="accent">
          <Sparkles className="mr-2 h-4 w-4" />
          Suggest Schedule
        </Button>

        {state.message && !state.schedule && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        {state.schedule && (
          <Card className="mt-8 bg-background/50">
            <CardHeader>
              <CardTitle>Suggested Match Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5">
                {state.schedule.map((match, index) => (
                  <li key={index} className="font-mono text-sm">
                    {match}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}

'use client';

import { useFormState } from 'react-dom';
import {
  CalendarIcon,
  Cloud,
  List,
  Map,
  MapPin,
  Sparkles,
} from 'lucide-react';
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

export function SchedulerForm() {
  const initialState: SchedulerState = { message: '', errors: {} };
  const [state, dispatch] = useFormState(generateSchedule, initialState);

  return (
    <form action={dispatch} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormItem>
          <FormLabel>
            <Map className="mr-2 inline-block h-4 w-4" />
            Participating Countries
          </FormLabel>
          <FormControl>
            <Input
              name="countries"
              placeholder="e.g., Nigeria, Ghana, Egypt"
            />
          </FormControl>
          <FormDescription>
            Comma-separated list of countries.
          </FormDescription>
          {state.errors?.countries && (
            <FormMessage>{state.errors.countries[0]}</FormMessage>
          )}
        </FormItem>
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
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
                      !name && 'text-muted-foreground'
                    )}
                  >
                    <span>Pick a date</span>
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  onSelect={(date) => {
                    const event = {
                      target: {
                        name: 'tournamentStartDate',
                        value: date ? format(date, 'yyyy-MM-dd') : '',
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    // A bit of a hack to make it work with form state
                    (event.target as any).form = (event.target as any).closest('form');
                  }}
                  initialFocus
                />
                 <Input type="hidden" name="tournamentStartDate" />
              </PopoverContent>
            </Popover>
            {state.errors?.tournamentStartDate && (
              <FormMessage>{state.errors.tournamentStartDate[0]}</FormMessage>
            )}
          </FormItem>
           <FormItem>
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
                      !name && 'text-muted-foreground'
                    )}
                  >
                    <span>Pick a date</span>
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                   onSelect={(date) => {
                    const event = {
                      target: {
                        name: 'tournamentEndDate',
                        value: date ? format(date, 'yyyy-MM-dd') : '',
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    (event.target as any).form = (event.target as any).closest('form');
                  }}
                  initialFocus
                />
                <Input type="hidden" name="tournamentEndDate" />
              </PopoverContent>
            </Popover>
             {state.errors?.tournamentEndDate && (
              <FormMessage>{state.errors.tournamentEndDate[0]}</FormMessage>
            )}
          </FormItem>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormItem>
          <FormLabel>
            <List className="mr-2 inline-block h-4 w-4" />
            Existing Schedules
          </FormLabel>
          <FormControl>
            <Textarea
              name="existingSchedules"
              placeholder="Country: [Match 1, Match 2]&#10;Nigeria: [vs Brazil on 2024-08-05]&#10;Ghana: [vs Argentina on 2024-08-07]"
              className="h-32 font-code text-xs"
            />
          </FormControl>
           {state.errors?.existingSchedules && (
            <FormMessage>{state.errors.existingSchedules[0]}</FormMessage>
          )}
        </FormItem>
        <FormItem>
          <FormLabel>
            <MapPin className="mr-2 inline-block h-4 w-4" />
            Stadium Availabilities
          </FormLabel>
          <FormControl>
            <Textarea
              name="stadiumAvailabilities"
              placeholder="Stadium Name: [Date 1, Date 2]&#10;Lagos Stadium: [2024-08-10, 2024-08-12]&#10;Accra Stadium: [2024-08-11, 2024-08-13]"
              className="h-32 font-code text-xs"
            />
          </FormControl>
           {state.errors?.stadiumAvailabilities && (
            <FormMessage>{state.errors.stadiumAvailabilities[0]}</FormMessage>
          )}
        </FormItem>
        <FormItem>
          <FormLabel>
            <Cloud className="mr-2 inline-block h-4 w-4" />
            Weather Forecasts
          </FormLabel>
          <FormControl>
            <Textarea
              name="weatherForecasts"
              placeholder="Location: Forecast&#10;Lagos: Sunny&#10;Accra: Clear skies"
              className="h-32 font-code text-xs"
            />
          </FormControl>
           {state.errors?.weatherForecasts && (
            <FormMessage>{state.errors.weatherForecasts[0]}</FormMessage>
          )}
        </FormItem>
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
                <li key={index} className="font-mono text-sm">{match}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </form>
  );
}

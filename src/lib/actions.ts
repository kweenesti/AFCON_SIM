'use server';

import {
  suggestMatchSchedule,
  type SuggestMatchScheduleInput,
  type SuggestMatchScheduleOutput,
} from '@/ai/flows/suggest-match-schedule';
import { z } from 'zod';

const parseRecord = (input: string): Record<string, any> => {
  if (!input) return {};
  try {
    // A simplified parser for the example format "Key: Value\nKey2: Value2"
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const record: Record<string, any> = {};
    lines.forEach(line => {
      const parts = line.split(':');
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
       if (value.startsWith('[') && value.endsWith(']')) {
        record[key] = value.substring(1, value.length - 1).split(',').map(s => s.trim());
      } else {
        record[key] = value;
      }
    });
    return record;
  } catch (e) {
    console.error("Failed to parse record:", e);
    return {};
  }
};


const FormSchema = z.object({
  countries: z.string().min(1, 'Please enter at least one country.'),
  tournamentStartDate: z.string().min(1, 'Please select a start date.'),
  tournamentEndDate: z.string().min(1, 'Please select an end date.'),
  existingSchedules: z.string().optional(),
  stadiumAvailabilities: z.string().optional(),
  weatherForecasts: z.string().optional(),
});

export type SchedulerState = {
  message?: string;
  schedule?: string[];
  errors?: {
    countries?: string[];
    tournamentStartDate?: string[];
    tournamentEndDate?: string[];
    existingSchedules?: string[];
    stadiumAvailabilities?: string[];
    weatherForecasts?: string[];
    root?: string[];
  };
};

export async function generateSchedule(
  prevState: SchedulerState,
  formData: FormData
): Promise<SchedulerState> {
  const validatedFields = FormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input provided.',
    };
  }

  const {
    countries,
    tournamentStartDate,
    tournamentEndDate,
    existingSchedules,
    stadiumAvailabilities,
    weatherForecasts,
  } = validatedFields.data;

  const aiInput: SuggestMatchScheduleInput = {
    countries: countries.split(',').map((c) => c.trim()),
    tournamentStartDate,
    tournamentEndDate,
    existingSchedules: parseRecord(existingSchedules || ''),
    stadiumAvailabilities: parseRecord(stadiumAvailabilities || ''),
    weatherForecasts: parseRecord(weatherForecasts || ''),
  };

  try {
    const result: SuggestMatchScheduleOutput = await suggestMatchSchedule(
      aiInput
    );
    if (result && result.suggestedSchedule) {
       return {
        message: 'Schedule generated successfully.',
        schedule: result.suggestedSchedule,
      };
    } else {
        return { message: 'AI failed to return a valid schedule.' };
    }
   
  } catch (e) {
    console.error(e);
    return { message: 'An unexpected error occurred while generating the schedule.' };
  }
}

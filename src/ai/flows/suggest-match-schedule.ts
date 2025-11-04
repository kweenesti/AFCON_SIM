'use server';

/**
 * @fileOverview AI tool for proposing and scheduling matches in the tournament.
 *
 * - suggestMatchSchedule - A function that suggests a match schedule considering various factors.
 * - SuggestMatchScheduleInput - The input type for the suggestMatchSchedule function.
 * - SuggestMatchScheduleOutput - The return type for the suggestMatchSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMatchScheduleInputSchema = z.object({
  countries: z
    .array(z.string())
    .describe('List of countries participating in the tournament.'),
  existingSchedules: z
    .record(z.array(z.string()))
    .describe(
      'A map of country to a list of their existing scheduled matches.  The keys are the countries, the values are a list of match descriptions (teams and dates).'
    ),
  stadiumAvailabilities: z
    .record(z.array(z.string()))
    .describe(
      'A map of stadium to a list of their available dates. The keys are the stadium names, the values are a list of available dates.'
    ),
  weatherForecasts: z
    .record(z.string())
    .describe(
      'A map of location to weather forecasts. The keys are locations, the values are weather forecasts.'
    ),
  tournamentStartDate: z
    .string()
    .describe('The start date of the tournament in ISO format.'),
  tournamentEndDate: z
    .string()
    .describe('The end date of the tournament in ISO format.'),
});

export type SuggestMatchScheduleInput = z.infer<
  typeof SuggestMatchScheduleInputSchema
>;

const SuggestMatchScheduleOutputSchema = z.object({
  suggestedSchedule: z
    .array(z.string())
    .describe('Suggested match schedule considering all constraints.'),
});

export type SuggestMatchScheduleOutput = z.infer<
  typeof SuggestMatchScheduleOutputSchema
>;

export async function suggestMatchSchedule(
  input: SuggestMatchScheduleInput
): Promise<SuggestMatchScheduleOutput> {
  return suggestMatchScheduleFlow(input);
}

const suggestMatchSchedulePrompt = ai.definePrompt({
  name: 'suggestMatchSchedulePrompt',
  input: {schema: SuggestMatchScheduleInputSchema},
  output: {schema: SuggestMatchScheduleOutputSchema},
  prompt: `You are a tournament organizer responsible for scheduling matches.

  Given the following information about the countries participating, their existing schedules, stadium availabilities, and weather forecasts, suggest an optimal match schedule for the tournament that minimizes player fatigue and maximizes viewership.

  Countries: {{{countries}}}
  Existing Schedules: {{{existingSchedules}}}
  Stadium Availabilities: {{{stadiumAvailabilities}}}
  Weather Forecasts: {{{weatherForecasts}}}
  Tournament Start Date: {{{tournamentStartDate}}}
  Tournament End Date: {{{tournamentEndDate}}}

  Consider the following factors when creating the schedule:
  - Avoid scheduling matches for countries on consecutive days to minimize player fatigue.
  - Schedule matches at stadiums with good weather forecasts to maximize viewership.
  - Consider existing schedules to avoid conflicts.
  - Use tournament start and end dates to ensure the schedule is correct

  Output the schedule as a list of match descriptions, where each description includes the two teams playing, the date, and the stadium.
  `,
});

const suggestMatchScheduleFlow = ai.defineFlow(
  {
    name: 'suggestMatchScheduleFlow',
    inputSchema: SuggestMatchScheduleInputSchema,
    outputSchema: SuggestMatchScheduleOutputSchema,
  },
  async input => {
    const {output} = await suggestMatchSchedulePrompt(input);
    return output!;
  }
);

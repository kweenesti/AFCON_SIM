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
  prompt: `You are an expert AI tournament organizer. Your task is to create an optimal match schedule for a football tournament.

  Here is the data you must work with:
  - Participating Countries: {{{countries}}}
  - Known Pre-existing Schedules (if any): {{{existingSchedules}}}
  - Stadium Availability: {{{stadiumAvailabilities}}}
  - Weather Forecasts: {{{weatherForecasts}}}
  - Tournament Window: From {{{tournamentStartDate}}} to {{{tournamentEndDate}}}

  Your goal is to generate a schedule that is fair, logical, and maximizes fan engagement. Follow these rules strictly:
  1.  **Rest Days are Mandatory**: Each team MUST have at least two full rest days between their matches. Do not schedule a team to play on consecutive days or with only one day of rest.
  2.  **Prioritize Weekends**: To maximize viewership and attendance, schedule high-profile matches or as many matches as possible on Saturdays and Sundays.
  3.  **Use Available Stadiums Only**: Only schedule matches at stadiums on dates they are explicitly listed as available.
  4.  **Avoid Bad Weather**: If a location has a forecast of "rain", "storm", or "heavy wind", try to avoid scheduling matches there. Prioritize locations with "sunny" or "clear skies".
  5.  **Respect Existing Conflicts**: Do not schedule a match for a team if it conflicts with their existingSchedules.
  6.  **Stay Within Tournament Dates**: All matches must be scheduled on or after tournamentStartDate and on or before tournamentEndDate.
  7.  **Output Format**: Your final output must be a list of strings. Each string should represent one match in the format: "Team A vs Team B at [Stadium Name] on YYYY-MM-DD".

  Based on these rules and the data provided, create and output the optimal schedule.
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

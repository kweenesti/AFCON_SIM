
'use server';

/**
 * @fileOverview AI tool for proposing and scheduling matches in the tournament.
 *
 * - suggestMatchSchedule - A function that suggests a match schedule considering various factors.
 */

import {getGenkitAi} from '@/ai/genkit';
import {
  SuggestMatchScheduleInputSchema,
  SuggestMatchScheduleOutputSchema,
  type SuggestMatchScheduleInput,
  type SuggestMatchScheduleOutput,
} from '@/ai/schemas/match-schedule';


export async function suggestMatchSchedule(
  input: SuggestMatchScheduleInput
): Promise<SuggestMatchScheduleOutput> {
  const ai = getGenkitAi();

  const suggestMatchScheduleFlow = ai.defineFlow(
    {
      name: 'suggestMatchScheduleFlow',
      inputSchema: SuggestMatchScheduleInputSchema,
      outputSchema: SuggestMatchScheduleOutputSchema,
    },
    async input => {
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

      const {output} = await suggestMatchSchedulePrompt(input);
      return output!;
    }
  );

  return suggestMatchScheduleFlow(input);
}

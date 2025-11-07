
import { z } from 'genkit';

export const SuggestMatchScheduleInputSchema = z.object({
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

export const SuggestMatchScheduleOutputSchema = z.object({
  suggestedSchedule: z
    .array(z.string())
    .describe('Suggested match schedule considering all constraints.'),
});

export type SuggestMatchScheduleOutput = z.infer<
  typeof SuggestMatchScheduleOutputSchema
>;

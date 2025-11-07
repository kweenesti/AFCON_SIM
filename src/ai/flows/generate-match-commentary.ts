
'use server';

/**
 * @fileOverview AI tool for generating football match commentary.
 *
 * - generateMatchCommentary - A function that creates a play-by-play commentary for a match.
 */

import { getGenkitAi } from '@/ai/genkit';
import {
  GenerateMatchCommentaryInputSchema,
  GenerateMatchCommentaryOutputSchema,
  type GenerateMatchCommentaryInput,
  type GenerateMatchCommentaryOutput,
} from '@/ai/schemas/match-commentary';

export async function generateMatchCommentary(
  input: GenerateMatchCommentaryInput
): Promise<GenerateMatchCommentaryOutput> {
  const ai = getGenkitAi();
  
  const generateMatchCommentaryFlow = ai.defineFlow(
    {
      name: 'generateMatchCommentaryFlow',
      inputSchema: GenerateMatchCommentaryInputSchema,
      outputSchema: GenerateMatchCommentaryOutputSchema,
    },
    async (input) => {
      const prompt = ai.definePrompt({
        name: 'generateMatchCommentaryPrompt',
        input: { schema: GenerateMatchCommentaryInputSchema },
        output: { schema: GenerateMatchCommentaryOutputSchema },
        prompt: `You are an expert football commentator. Generate a play-by-play commentary for a match between two teams based on their squads and player ratings.

  **Home Team: {{homeTeam.countryName}}**
  Squad:
  {{#each homeTeam.squad}}
  - {{name}} ({{naturalPosition}}, GK: {{gkRating}}, DF: {{dfRating}}, MD: {{mdRating}}, AT: {{atRating}}) {{#if isCaptain}}(Captain){{/if}}
  {{/each}}

  **Away Team: {{awayTeam.countryName}}**
  Squad:
  {{#each awayTeam.squad}}
  - {{name}} ({{naturalPosition}}, GK: {{gkRating}}, DF: {{dfRating}}, MD: {{mdRating}}, AT: {{atRating}}) {{#if isCaptain}}(Captain){{/if}}
  {{/each}}

  Your task is to write a compelling, minute-by-minute style commentary. The commentary must:
  1.  **Simulate a full 90-minute match**. Mention key moments like kick-off, great saves, near misses, fouls, and half-time.
  2.  **Determine Goal Scorers**: Based on player ratings (especially 'AT' and 'MD'), decide which players are more likely to score. A higher rating means a higher chance of scoring.
  3.  **Create a Narrative**: Build tension and excitement. Describe the flow of the game. Does one team dominate? Is it a close-fought battle?
  4.  **Declare a Winner**: The match must have a winner. If the score is tied after 90 minutes, simulate extra time and, if necessary, a penalty shootout to determine the winner. Mention this in the commentary.
  5.  **Format Goals Correctly**: For each goal, you must include it in the 'goals' array in the output with the player's name, the minute they scored, and their teamId.
  6.  **Provide Final Score**: The final score must be reflected in the 'homeScore' and 'awayScore' fields and the winner in the 'winnerId' field.
  7.  **Be Creative**: Make the commentary exciting and realistic. Use descriptive language.
  
  Please generate the commentary, final score, goal details, and the winner ID now.
  `,
      });

      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI did not return a valid output.');
      }
      return output;
    }
  );

  return generateMatchCommentaryFlow(input);
}

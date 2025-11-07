
import { z } from 'genkit';

const PlayerSchema = z.object({
  id: z.string(),
  federationId: z.string(),
  name: z.string(),
  naturalPosition: z.enum(['GK', 'DF', 'MD', 'AT']),
  gkRating: z.number(),
  dfRating: z.number(),
  mdRating: z.number(),
  atRating: z.number(),
  isCaptain: z.boolean(),
});

const TeamSchema = z.object({
  id: z.string(),
  countryName: z.string(),
  squad: z.array(PlayerSchema),
});

export const GenerateMatchCommentaryInputSchema = z.object({
  homeTeam: TeamSchema,
  awayTeam: TeamSchema,
});

export type GenerateMatchCommentaryInput = z.infer<
  typeof GenerateMatchCommentaryInputSchema
>;

export const GenerateMatchCommentaryOutputSchema = z.object({
  commentary: z
    .string()
    .describe(
      'A play-by-play text commentary of the football match, including key moments, goals with scorers and times, and a final result. The commentary should be engaging and descriptive.'
    ),
  homeScore: z.number().describe('The final score for the home team.'),
  awayScore: z.number().describe('The final score for the away team.'),
  goals: z
    .array(
      z.object({
        playerName: z.string().describe('Name of the player who scored.'),
        minute: z
          .number()
          .describe('The minute of the match when the goal was scored.'),
        teamId: z.string().describe('The ID of the team that scored.'),
      })
    )
    .describe('A list of all goals scored in the match.'),
  winnerId: z
    .string()
    .describe(
      'The ID of the winning team. If it is a draw which is resolved by penalties, this should be the winner of the shootout.'
    ),
});

export type GenerateMatchCommentaryOutput = z.infer<
  typeof GenerateMatchCommentaryOutputSchema
>;

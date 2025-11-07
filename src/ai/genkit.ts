import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Note: This file is intentionally structured to export a function
// that returns the AI instance. This is to ensure that the `googleAI()`
// plugin, which depends on `process.env.GEMINI_API_KEY`, is initialized
// only when needed, after `dotenv/config` has had a chance to run in
// the server action that calls the AI flow.
export function getGenkitAi() {
    return genkit({
        plugins: [googleAI()],
        model: 'googleai/gemini-2.5-flash',
    });
}

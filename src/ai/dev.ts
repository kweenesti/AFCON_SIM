'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-match-schedule.ts';
import '@/ai/flows/generate-match-commentary.ts';

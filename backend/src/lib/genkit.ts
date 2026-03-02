import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Genkit with Google AI plugin
export const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash, // Default model for pricing logic
});

// Definition for surge pricing calculation
export const calculateSurgePrice = ai.defineTool(
    {
        name: "calculateSurgePrice",
        description: "Calculates a surge multiplier based on traffic, demand, and time of day in Tamil Nadu.",
        inputSchema: z.object({
            baseFare: z.number(),
            trafficIntensity: z.enum(['low', 'medium', 'high', 'extreme']),
            demandLevel: z.enum(['low', 'medium', 'high', 'extreme']),
            timeOfDay: z.string(), // e.g., "18:00"
        }),
        outputSchema: z.object({
            multiplier: z.number(),
            reason: z.string(),
            surgeFare: z.number(),
        }),
    },
    async (input) => {
        let multiplier = 1.0;

        if (input.trafficIntensity === 'high') multiplier += 0.2;
        if (input.trafficIntensity === 'extreme') multiplier += 0.5;
        if (input.demandLevel === 'high') multiplier += 0.3;
        if (input.demandLevel === 'extreme') multiplier += 0.7;

        return {
            multiplier,
            reason: `Calculated based on ${input.trafficIntensity} traffic and ${input.demandLevel} demand levels.`,
            surgeFare: Math.round(input.baseFare * multiplier),
        };
    }
);

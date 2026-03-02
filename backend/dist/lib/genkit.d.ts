import { z } from 'genkit';
export declare const ai: import("genkit").Genkit;
export declare const calculateSurgePrice: import("genkit").ToolAction<z.ZodObject<{
    baseFare: z.ZodNumber;
    trafficIntensity: z.ZodEnum<["low", "medium", "high", "extreme"]>;
    demandLevel: z.ZodEnum<["low", "medium", "high", "extreme"]>;
    timeOfDay: z.ZodString;
}, "strip", z.ZodTypeAny, {
    baseFare: number;
    trafficIntensity: "low" | "medium" | "high" | "extreme";
    demandLevel: "low" | "medium" | "high" | "extreme";
    timeOfDay: string;
}, {
    baseFare: number;
    trafficIntensity: "low" | "medium" | "high" | "extreme";
    demandLevel: "low" | "medium" | "high" | "extreme";
    timeOfDay: string;
}>, z.ZodObject<{
    multiplier: z.ZodNumber;
    reason: z.ZodString;
    surgeFare: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    multiplier: number;
    reason: string;
    surgeFare: number;
}, {
    multiplier: number;
    reason: string;
    surgeFare: number;
}>>;

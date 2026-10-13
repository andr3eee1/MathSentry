export type ScanRequest = { image?: string; meta?: any };
export type ScanResponse = { id: string; regions: any[]; summary: string };

export type InspectResponse = { id: string; steps: any[]; hints: any[] };
export type HintResponse = { text: string; media?: any; level: string };
export type FeedbackResponse = { ok: boolean };

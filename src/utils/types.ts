// src/types.ts
export interface Vraag {
  id: number;
  vraagTekst: string;
  antwoorden: string[];
  correctAntwoordIndex: number;
}
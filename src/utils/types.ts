// src/types.ts
export interface Vraag {
  id: number;
  vraagTekst: string;
  antwoorden: string[];
  correctAntwoordIndex: number;
  categorie?: string;
  uitleg?: string;
}

export const STANDAARD_CATEGORIEEN = [
  "Algemeen",
  "Hardware",
  "Software",
  "Netwerken",
  "Beveiliging",
  "Wetgeving",
  "Cloud"
];
// src/types.ts
export interface Vraag {
    correctAntwoordIndex: any;
id: number;
  module_id: number;
  vraag_tekst: string;   // Voeg deze toe (matcht met DB)
  vraagTekst?: string;   // Hou deze optioneel voor de zekerheid
  antwoorden: string[] | string;
  categorie: string;
  uitleg?: string;
  correct_index?: number;
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
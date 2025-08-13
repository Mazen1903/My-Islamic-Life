export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
  occasion: string;
  reference: string;
  fullReference?: string;
  repetitions?: number;
  subcategory?: string;
}

export interface DuaSubcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  duas: Dua[];
}

export interface ZikrSeries {
  id: string;
  title: string;
  description: string;
  categories: string[];
  icon: string;
  // Either subcategories OR duas directly - not both
  subcategories?: DuaSubcategory[];
  duas?: Dua[];
}

export interface ZikrCategory {
  id: string;
  name: string;
  icon: string;
} 
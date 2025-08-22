// Tipos para o sistema de construção de páginas

export interface PageSection {
  id: string;
  type: string; // hero, content, gallery, testimonials, etc.
  name: string;
  data: Record<string, any>;
  position: number;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  sections: PageSection[];
  preview?: string;
}

export interface SectionType {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: SectionField[];
  defaultData: Record<string, any>;
  preview: string;
}

export interface SectionField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'image' | 'color' | 'select' | 'number' | 'boolean';
  label: string;
  placeholder?: string;
  options?: string[]; // Para select
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface PageData {
  id?: string;
  slug: string;
  title: string;
  metaDescription?: string;
  layout: string;
  sections: PageSection[];
  isPublished: boolean;
}
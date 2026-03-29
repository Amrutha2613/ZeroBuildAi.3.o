
export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  projects: Project[];
  createdAt: number;
  lastLogin: number;
}

export interface PlotDetails {
  length: number;
  breadth: number;
  totalArea: number;
}

export enum BuildingType {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  MIXED_USE = 'Mixed-Use',
  INDUSTRIAL = 'Industrial',
  HOSPITALITY = 'Hospitality',
  HEALTHCARE = 'Healthcare'
}

export interface FurnitureItem {
  name: string;
  rate: number;
  type?: string;
  shopLink: string;
}

export interface RoomConfig {
  id: string;
  name: string;
  color: string;
  furnitureDescription?: string;
  furnitureItems: FurnitureItem[];
  images?: {
    before: string; // Empty raw room
    after: string;  // Fully furnished room
  };
  budgetAnalysis?: {
    interior: number;
    furnitureTotal: number;
  };
}

export type FeedbackLevel = 'Average' | 'Good' | 'Very Good' | 'Excellent' | 'Outstanding';

export interface Project {
  id: string;
  timestamp: number;
  plot: PlotDetails;
  type: BuildingType;
  style: string;
  floors: number;
  rooms: RoomConfig[];
  location: string;
  budgetPreference: string;
  colors: {
    primary: string;
    shade: string;
  };
  mainImages: {
    before: string;
    after: string;
  };
  summary: string;
  totalEstimatedBudget: number;
  feedback?: FeedbackLevel;
}

export enum AppLanguage {
  EN = 'English',
  TE = 'Telugu',
  HI = 'Hindi'
}

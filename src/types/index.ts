export type UserRole = 'customer' | 'artist';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface ArtistProfile {
  id: string;
  user_id: string;
  experience_years: number;
  specializations: string[];
  bio: string;
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  full_name: string;
  avatar_url?: string;
}

export const ART_STYLES = [
  'Tanjore Painting', 'Kalamkari', 'Pattachitra', 'Warli Painting',
  'Madhubani Painting', 'Kalighat Painting', 'Pichwai Art', 'Cheriyal Art',
  'Gond Art', 'Phad Painting', 'Bhil Art', 'Sohrai and Khovar',
  'Saura Painting', 'Thangka Painting', 'Mysore Painting', 'Kerala Murals',
  'Kangra Painting', 'Roghan Art', 'Aipan'
] as const;

export const ART_TYPES = ['Wall Painting', 'Mural', 'Canvas'] as const;
export const MEDIUMS = ['Wall', 'Canvas', 'Wood', 'Fabric'] as const;

export type ArtStyle = typeof ART_STYLES[number];
export type ArtType = typeof ART_TYPES[number];
export type Medium = typeof MEDIUMS[number];

export type OrderStatus =
  | 'request_sent'
  | 'artist_accepted'
  | 'price_negotiation'
  | 'in_progress'
  | 'completed'
  | 'delivered';

export interface ArtRequest {
  id: string;
  customer_id: string;
  artist_id?: string;
  description: string;
  art_style: ArtStyle;
  art_type: ArtType;
  medium: Medium;
  width: number;
  height: number;
  budget_min: number;
  budget_max: number;
  reference_images: string[];
  ai_preview_images: string[];
  selected_preview: string;
  final_prompt: string;
  status: OrderStatus;
  ai_suggested_price?: number;
  artist_price?: number;
  customer_counter_price?: number;
  final_price?: number;
  created_at: string;
  updated_at: string;
}

export interface GenerateArtForm {
  description: string;
  artStyle: ArtStyle;
  artType: ArtType;
  medium: Medium;
  width: number;
  height: number;
  budgetMin: number;
  budgetMax: number;
  referenceImages: File[];
}

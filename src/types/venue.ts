// src/types/venue.ts
export type VenueMedia = { url: string; alt?: string | null };
export type VenueMeta = {
  wifi?: boolean;
  parking?: boolean;
  breakfast?: boolean;
  pets?: boolean;
};
export type VenueLocation = {
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  continent?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type Venue = {
  id: string;
  name: string;
  description?: string;
  media?: VenueMedia[];
  price: number;
  maxGuests: number;
  rating?: number;
  created?: string;
  updated?: string;
  meta?: VenueMeta;
  location?: VenueLocation;
};

export type ListMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

export type ListResponse<T> = {
  data: T[];
  meta: ListMeta;
};

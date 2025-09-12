export type Booking = {
  id: string;
  dateFrom: string; // ISO string
  dateTo: string;   // ISO string
  guests: number;
  created: string;
  updated: string;
};

export type BookingWithVenue = Booking & {
  venue?: {
    id: string;
    name: string;
    description?: string;
    media?: { url: string; alt?: string }[];
    price: number;
    maxGuests: number;
    rating?: number;
  };
};

export type BookingWithCustomer = Booking & {
  customer?: {
    name?: string;
    email?: string;
    avatar?: { url?: string; alt?: string };
  };
};

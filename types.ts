
export interface Jam {
  id: number;
  jam_name: string;
  date_happening: string;
  location: string;
  attendees?: User[];
  created_at: string;
  capacity: number;
  owner_email: string;
}


export interface User {
  id: number;
  name: string;
  email: string;
  instruments?: ("guitar" | "piano" | "drums" | "bass" | "vocals" | "other")[];
  availability?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
  genres?: number[];

}

export interface UserProfile {
    id: number;
    name: string;
    username: string;
    email: string;
    description?: string;
    instruments?: ("guitar" | "piano" | "drums" | "bass" | "vocals" | "other")[];
    spotify_link?: string;
    soundcloud_link?: string;
    instagram_link?: string;
    tiktok_link?: string;
    availability?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    genres?: number[];
  }
  
  export interface Jam {
    id: number;
    jam_name: string;
    capacity: number;
    location: string;
    owner_email: string;
    created_at: string;
    date_happening: string;
  }

export interface Genre {
  id: number;
  name: string;
}

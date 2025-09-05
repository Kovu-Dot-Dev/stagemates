
export interface Jam {
  id?: number;
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
  instruments: string[];
}

export interface UserProfile {
    id: number;
    name: string;
    username: string;
    email: string;
    description?: string;
    instruments: string[];
    spotify_link?: string;
    soundcloud_link?: string;
    instagram_link?: string;
    tiktok_link?: string;
  }
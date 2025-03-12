export interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: Array<number>;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  rating?: number;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
export interface GuestSession {
  expires_at: string;
  guest_session_id: string;
  success: boolean;
}
export type HandleRate = (event: number, movie: Movie) => void;

export interface RateObject {
  id: number;
  rate: number;
}

import { FC } from "react";
import "../movieList.css";
import placeholder from "../../assets/fluffykitten.png";
import { format } from "date-fns";

interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: Array<number>;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
interface Props {
  movie: Movie;
}
const MovieCard: FC<Props> = (props) => {
  const { movie } = props;
  return (
    <div className="movieCard" key={movie.id}>
      <div className="poster_half">
        <img
          className="movieCard__poster"
          src={
            movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : placeholder
          }
        ></img>
      </div>
      <div className="content_half" style={{ width: 251 }}>
        <div className="movieCard__movieTitle">{movie.title}</div>
        <div className="movieCard__rank">{movie.vote_average.toFixed(1)}</div>
        <div className="movieCard__date">
          {movie.release_date ? format(movie.release_date, "MMMM dd, yyyy") : "Unknown date"}
        </div>
        <div className="movieCard__genres">
          {movie.genre_ids.map((genre: number) => (
            <div key={genre} className="movieCard__genre">
              Genre
            </div>
          ))}
        </div>
        <div className="movieCard__description">{movie.overview}</div>
        <div className="movieCard__rating"></div>
      </div>
    </div>
  );
};

export default MovieCard;

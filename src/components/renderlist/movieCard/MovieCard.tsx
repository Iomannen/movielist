import { FC } from "react";
import style from "./movieCard.module.css";
import placeholder from "../../../assets/fluffykitten.png";
import { format } from "date-fns";
import { Rate, ConfigProvider } from "antd";
import { Movie, RateObject, APIGenresAnswer, HandleRate } from "../../../types/types";
interface Props {
  movie: Movie;
  genres: APIGenresAnswer | null;
  callback: HandleRate;
}

const MovieCard: FC<Props> = (props) => {
  const { movie, genres, callback } = props;

  const findGenre = (genreNumber: number): string => {
    let returnGenre;
    genres?.genres.forEach((genre) => {
      if (genre.id === genreNumber) returnGenre = genre.name;
    });
    return returnGenre !== undefined ? returnGenre : "Genre";
  };

  const getDefaultRate = (): number => {
    const storageRatedMovies = localStorage.getItem("rated_movies");
    if (storageRatedMovies === null) return 0;
    const ratedMovies = JSON.parse(storageRatedMovies);
    const mov = ratedMovies.find((rated: RateObject) => movie.id === rated.id);
    if (mov?.rate === undefined) return 0;
    return mov?.rate;
  };

  const pickColor = (rank: number) => {
    return rank >= 7
      ? style.green
      : rank >= 5
        ? style.yellow
        : rank >= 3
          ? style.orange
          : style.red;
  };

  return (
    <div className={style.card}>
      <div className="poster_half">
        <img
          className={style.poster}
          src={
            movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : placeholder
          }
        ></img>
      </div>
      <div className={style.content_half} style={{ width: 251 }}>
        <div className={style.title}>{movie.title}</div>
        <div className={pickColor(movie.vote_average)}>{movie.vote_average.toFixed(1)}</div>
        <div className={style.date}>
          {movie.release_date ? format(movie.release_date, "MMMM dd, yyyy") : "Unknown date"}
        </div>
        <div className={style.genres}>
          {movie.genre_ids.map((genre: number) => (
            <div key={genre} className={style.genre}>
              {findGenre(genre)}
            </div>
          ))}
        </div>
        <div className={style.description}>{movie.overview}</div>
        <ConfigProvider
          theme={{
            components: {
              Rate: {
                starSize: 16,
                starBg: "rgb(216, 216, 216)",
              },
            },
          }}
        >
          <Rate
            className={style.stars}
            count={10}
            onChange={(event) => {
              callback(event, movie);
            }}
            defaultValue={movie.rating ? movie.rating : getDefaultRate()}
          />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default MovieCard;

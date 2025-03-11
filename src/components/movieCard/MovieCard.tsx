import { FC, useContext } from "react";
import style from "./movieCard.module.css";
import placeholder from "../../assets/fluffykitten.png";
import { format } from "date-fns";
import { GenreContext } from "../MovieList";
import { Rate, ConfigProvider } from "antd";
import { GuestSession } from "../MovieList";

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
  rating?: number;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface Props {
  movie: Movie;
  session: GuestSession | null;
}
interface Rate {
  id: number;
  rate: number;
}

const ratedMovies: Rate[] = [];

const MovieCard: FC<Props> = (props) => {
  const { movie, session } = props;
  const genres = useContext(GenreContext);
  // ВОТ ФУНКЦИЯ КОТОРАЯ ОТПРАВЛЯЕТ ФИЛЬМ
  const handleRate = (event: number) => {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json;charset=utf-8",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2IyNDYzMGY0MjcyZmM2MWQ0YzkxNGIzNTFiNzNhNCIsIm5iZiI6MTc0MDczMTM5MS4wOTEsInN1YiI6IjY3YzE3M2ZmMWYzZjgxYjYwN2EyMzE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Gmh5Sci3JPkNbF8Y85ap3r7DGnRpgB_k0J7L_3AuHkg",
      },
      body: `{"value":${event}}`,
    };
    const postRate = async () => {
      const postMovieRate = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}/rating?guest_session_id=${session?.guest_session_id}`,
        options,
      );
      const res = await postMovieRate.json();
      console.log(res);
      console.log(postMovieRate);
    };
    postRate();
    const check = ratedMovies.findIndex((rated) => movie.id === rated.id);
    if (check !== -1) {
      ratedMovies.splice(check, 1);
    }
    const ratedMovie: Rate = {
      id: movie.id,
      rate: event,
    };
    ratedMovies.push(ratedMovie);
  };

  const findRateDefaultValue = (): number => {
    const mov = ratedMovies.find((rated) => movie.id === rated.id);
    if (mov?.rate === undefined) return 0;
    return mov?.rate;
  };
  // ПРОСТО ПОДСТАВКА ЖАНРОВ
  const findGenre = (genreNumber: number): string => {
    let returnGenre;
    genres?.genres.forEach((genre) => {
      if (genre.id === genreNumber) returnGenre = genre.name;
    });
    return returnGenre !== undefined ? returnGenre : "Genre";
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
            onChange={handleRate}
            defaultValue={findRateDefaultValue()}
          />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default MovieCard;

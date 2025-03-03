import { FC, useState, useEffect } from "react";
import style from "./movieList.module.css";
import { Spin, Alert } from "antd";
import MovieCard from "./movieCard/MovieCard";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2IyNDYzMGY0MjcyZmM2MWQ0YzkxNGIzNTFiNzNhNCIsIm5iZiI6MTc0MDczMTM5MS4wOTEsInN1YiI6IjY3YzE3M2ZmMWYzZjgxYjYwN2EyMzE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Gmh5Sci3JPkNbF8Y85ap3r7DGnRpgB_k0J7L_3AuHkg",
  },
};

interface Error {
  state: boolean;
  message: string | null;
}
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

const MovieList: FC = () => {
  const [movieList, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<Error>({ state: false, message: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleOffline = () => {
    return isOnline ? (
      ""
    ) : (
      <Alert message="Error" description="Internet connection error" type="error" showIcon />
    );
  };

  const handleError = () => {
    return !error.state ? (
      ""
    ) : error.message === "Failed to fetch" ? (
      <Alert
        className={style.alert}
        message="Error"
        description="Failed to fetch. Please try to reload page using VPN"
        type="error"
        showIcon
      />
    ) : (
      <Alert
        message="Error"
        description={error.message}
        type="error"
        showIcon
        className={style.alert}
      />
    );
  };

  const showSpinner = () => {
    return movieList.length === 0 && !error.state ? (
      <Spin size="large" className={style.alert} />
    ) : (
      ""
    );
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          "https://api.themoviedb.org/3/search/movie?query=return&include_adult=false&language=en-US&page=1",
          options,
        );

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.results);
        setMovies(data.results);
      } catch (e: unknown) {
        if (!(e instanceof Error)) return;
        setError({ state: true, message: e.message });
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className={style.movielist}>
      {handleOffline()}
      {handleError()}
      {showSpinner()}
      {movieList.map((movie: Movie) => (
        <MovieCard movie={movie} />
      ))}
    </div>
  );
};

export default MovieList;

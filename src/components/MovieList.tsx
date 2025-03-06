import { FC, useState, useEffect, createContext } from "react";
import style from "./movieList.module.css";
import { Spin, Alert, Input } from "antd";
import MovieCard from "./movieCard/MovieCard";
import { ChangeEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import PaginationComponent from "./pagination/PaginationComponent";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2IyNDYzMGY0MjcyZmM2MWQ0YzkxNGIzNTFiNzNhNCIsIm5iZiI6MTc0MDczMTM5MS4wOTEsInN1YiI6IjY3YzE3M2ZmMWYzZjgxYjYwN2EyMzE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Gmh5Sci3JPkNbF8Y85ap3r7DGnRpgB_k0J7L_3AuHkg",
  },
};

interface Genre {
  id: number;
  name: string;
}

type GenreArray = Array<Genre>;

interface APIGenresAnswer {
  genres: GenreArray;
}

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
export const GenreContext = createContext<APIGenresAnswer | null>(null);

const MovieList: FC = () => {
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<string>("return");
  const [movieList, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<Error>({ state: false, message: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [genres, setGenres] = useState<APIGenresAnswer | null>(null);

  useEffect(() => {
    const makeContext = async () => {
      try {
        const genresResponse = await fetch(
          "https://api.themoviedb.org/3/genre/movie/list?language=en",
          options,
        );
        const genresData = await genresResponse.json();
        setGenres(genresData);
      } catch (e) {
        console.error("Failed to load genres:", e);
      }
    };

    if (genres === null) {
      makeContext();
    }
  });

  const handlePagination = (page: number) => {
    setPage(page);
    setMovies([]);
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${searchValue}&include_adult=false&language=en-US&page=${page}`,
          options,
        );
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data.results.length === 0) {
          throw new Error("Nothing is found");
        }
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } catch (e: unknown) {
        if (!(e instanceof Error)) return;
        setError({ state: true, message: e.message });
      }
    };
    fetchMovies();
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalPages(1);
    setPage(1);
    setError({ state: false, message: null });
    if (e.target.value == null) return;
    setMovies([]);
    setSearchValue(e.target.value);
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${e.target.value}&include_adult=false&language=en-US&page=1`,
          options,
        );

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data.results.length === 0) {
          throw new Error("Nothing is found");
        }
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } catch (error: unknown) {
        if (!(error instanceof Error)) return;
        setError({ state: true, message: error.message });
      }
    };
    fetchMovies();
  };

  const debounceSearch = useDebouncedCallback(handleSearch, 1000);

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
          `https://api.themoviedb.org/3/search/movie?query=return&include_adult=false&language=en-US&page=1`,
          options,
        );
        const session = await fetch(
          "https://api.themoviedb.org/3/authentication/guest_session/new",
          options,
        );
        const sessionJSON = await session.json();
        console.log(sessionJSON);
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } catch (e: unknown) {
        if (!(e instanceof Error)) return;
        setError({ state: true, message: e.message });
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className={style.movielist}>
      <Input className={style.input} placeholder="Type to search..." onChange={debounceSearch} />
      {handleOffline()}
      {handleError()}
      {showSpinner()}
      <GenreContext.Provider value={genres}>
        {movieList.map((movie: Movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </GenreContext.Provider>

      <PaginationComponent
        hide={!movieList.length}
        page={page}
        total={totalPages}
        onChange={handlePagination}
      />
    </div>
  );
};

export default MovieList;

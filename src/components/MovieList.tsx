import { FC, useState, useEffect, createContext } from "react";
import "@ant-design/v5-patch-for-react-19";
import style from "./movieList.module.css";
import { Spin, Alert, Input, Button } from "antd";
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
  rating?: number;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

type Render = "All" | "Rated";

export interface GuestSession {
  expires_at: string;
  guest_session_id: string;
  success: boolean;
}

export const GenreContext = createContext<APIGenresAnswer | null>(null);

const MovieList: FC = () => {
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<string>("return");
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [render, setRender] = useState<Render>("All");
  const [searchPage, setSearchPage] = useState<number>(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<Error>({ state: false, message: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [genres, setGenres] = useState<APIGenresAnswer | null>(null);

  const [guestSession, setSession] = useState<GuestSession | null>(null);
  // ЗАГРУЖАЕМ ЖАНРЫ ПРИ МАУНТЕ
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
  // ПАГИНАЦИЯ \ ПРОСТО ЗАГРУЗКА ДРУГОЙ СТРАНИЦЫ
  const handlePagination = (page: number) => {
    setPage(page);
    setMovieList([]);
    const fetchMovies = async () => {
      try {
        if (render === "All") {
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
          setMovieList(data.results);
          setMovies(data.results);
          setTotalPages(data.total_pages);
        }
        if (render === "Rated") {
          const response = await fetch(
            `https://api.themoviedb.org/3/guest_session/${guestSession?.guest_session_id}/rated/movies?language=en-US&page=${page}&sort_by=created_at.asc`,
            options,
          );
          if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
          }
          const data = await response.json();
          if (data.results.length === 0) {
            throw new Error("Nothing is found");
          }
          setMovieList(data.results);
          setTotalPages(data.total_pages);
        }
      } catch (e: unknown) {
        if (!(e instanceof Error)) return;
        setError({ state: true, message: e.message });
      }
    };
    fetchMovies();
  };
  // ЗАГРУЗКА ФИЛЬМОВ ПО СТРОКЕ ПОИСКА
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalPages(1);
    setPage(1);
    setError({ state: false, message: null });
    if (e.target.value == null) return;
    setMovieList([]);
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
        setMovieList(data.results);
        setMovies(data.results);
        setSearchPage(data.total_pages);
        setTotalPages(data.total_pages);
      } catch (error: unknown) {
        if (!(error instanceof Error)) return;
        setError({ state: true, message: error.message });
      }
    };
    fetchMovies();
  };
  // ДЕБАУНС
  const debounceSearch = useDebouncedCallback(handleSearch, 1000);
  // ОТОБРАЖЕНИЕ АЛЕРТА ПРИ ОФЛАЙНЕ
  const handleOffline = () => {
    return isOnline ? (
      ""
    ) : (
      <Alert message="Error" description="Internet connection error" type="error" showIcon />
    );
  };
  // ОТОБРАЖЕНИЕ АЛЕРТОВ
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
  // СПИННЕР-ЗАГРУЗКА
  const showSpinner = () => {
    if (movieList === undefined) return;
    return movieList.length === 0 && !error.state ? (
      <Spin size="large" className={style.alert} />
    ) : (
      ""
    );
  };
  // ОТСЛЕЖИВАНИЕ ОНЛАЙН\ОФЛАЙН
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
  // ВОТ ФУНКЦИЯ В ПЕРВЫЙ РАЗ ГРУЗЯЩАЯ ФИЛЬМЫ ПРИ МАУНТЕ ПО СЛОВУ RETURN
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
        setSession(sessionJSON);

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();
        setMovieList(data.results);
        setMovies(data.results);
        setSearchPage(data.total_pages);
        setTotalPages(data.total_pages);
      } catch (e: unknown) {
        if (!(e instanceof Error)) return;
        setError({ state: true, message: e.message });
      }
    };

    fetchMovies();
  }, []);
  // ВОТ ФУНКЦИЯ ГРУЗЯЩАЯ ОЦЕНЕННЫЕ ФИЛЬМЫ C СЕРВЕРА
  const setRated = () => {
    const getRatedMovies = async () => {
      try {
        const fetchRatedMovies = await fetch(
          `https://api.themoviedb.org/3/guest_session/${guestSession?.guest_session_id}/rated/movies?language=en-US&page=1&sort_by=created_at.asc`,
          options,
        );
        if (fetchRatedMovies.ok) {
          const ratedMovies = await fetchRatedMovies.json();
          setMovieList(ratedMovies.results);
          console.log(ratedMovies);
          setTotalPages(ratedMovies.total_pages);
        }
      } catch (e) {
        if (!(e instanceof Error)) return;
        setError({ state: true, message: e.message });
      }
    };
    getRatedMovies();
  };
  const handleButton = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.innerHTML === "Search") {
      setRender("All");
      setTotalPages(searchPage);
      setMovieList(movies);
    }
    if (target.innerHTML === "Rated") {
      setRender("Rated");
      setRated();
    }
  };

  return (
    <div className={style.movielist}>
      <Button onClick={handleButton}>Search</Button>
      <Button onClick={handleButton}>Rated</Button>
      <Input className={style.input} placeholder="Type to search..." onChange={debounceSearch} />
      {handleOffline()}
      {handleError()}
      {showSpinner()}
      <GenreContext.Provider value={genres}>
        {movieList.map((movie: Movie) => (
          <MovieCard movie={movie} key={movie.id} session={guestSession} />
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

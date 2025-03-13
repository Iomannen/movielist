import { FC, useState, useEffect, useRef, createContext } from "react";
import "@ant-design/v5-patch-for-react-19";
import style from "./movieList.module.css";
import { SearchInput } from "./input/SearchInput";
import { ChangeEvent } from "react";
import { NotFoundAlertComponent } from "./alerts/Alert";
import {
  Movie,
  GuestSession,
  HandleRate,
  RateObject,
  Tab,
  AlertInterface,
  APIGenresAnswer,
} from "../types/types.tsx";
import { RenderList } from "./renderlist/RenderList";
import { Loading } from "./loading/Loading";
import { TabsComponent } from "./tabs/Tabs.tsx";
import { InputRef } from "antd";
import { useDebouncedCallback } from "use-debounce";
import PaginationComponent from "./pagination/PaginationComponent.tsx";
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2IyNDYzMGY0MjcyZmM2MWQ0YzkxNGIzNTFiNzNhNCIsIm5iZiI6MTc0MDczMTM5MS4wOTEsInN1YiI6IjY3YzE3M2ZmMWYzZjgxYjYwN2EyMzE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Gmh5Sci3JPkNbF8Y85ap3r7DGnRpgB_k0J7L_3AuHkg",
  },
};
export const Callback = createContext<HandleRate>(() => {});
export const Genres = createContext<APIGenresAnswer | null>(null);
const ratedMovies: RateObject[] = [];

const notFoundAlert: AlertInterface = {
  show: true,
  alert_type: "Alert",
  alert_message: "It seems that search is empty, try to enter something and we'll find the movies.",
  alert_code: "Oops...",
};

const MovieList: FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertInterface>(notFoundAlert);
  const [session, setSession] = useState<GuestSession>();
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("Search");
  const [genres, setGenres] = useState<APIGenresAnswer | null>(null);
  const inputRef = useRef<InputRef>(null);

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

  const handleRate = (event: number, movie: Movie): void => {
    const options = {
      method: event === 0 ? "DELETE" : "POST",
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
    if (event === 0) {
      ratedMovies.splice(check, 1);
    } else {
      if (check !== -1) {
        ratedMovies.splice(check, 1);
      }
      const ratedMovie: RateObject = {
        id: movie.id,
        rate: event,
      };
      ratedMovies.push(ratedMovie);
    }
    localStorage.setItem("rated_movies", JSON.stringify(ratedMovies));
  };

  const createSession = async () => {
    const fetchSession = await fetch(
      "https://api.themoviedb.org/3/authentication/guest_session/new",
      options,
    );
    const sessionRes = await fetchSession.json();
    setSession(sessionRes);
    console.log(sessionRes);
    localStorage.setItem("session", JSON.stringify(sessionRes));
  };

  useEffect(() => {
    const localStorageRatedMovies = localStorage.getItem("rated_movies");
    if (localStorageRatedMovies === null) return;
    const parsedRatedMovies = JSON.parse(localStorageRatedMovies);
    parsedRatedMovies.forEach((movie: RateObject) => {
      ratedMovies.push(movie);
    });
    console.log(ratedMovies);
  }, []);

  useEffect(() => {
    const sessionLocalStorage = localStorage.getItem("session");
    if (sessionLocalStorage !== null) {
      const parsedSession = JSON.parse(sessionLocalStorage);
      if (new Date() > new Date(parsedSession.expires_at)) {
        createSession();
      } else {
        setSession(parsedSession);
      }
    } else {
      createSession();
    }
  }, []);

  const handlePagination = (event: number) => {
    setCurrentPage(event);
  };

  useEffect(() => {
    const fetchMovies = async (value: string) => {
      if (tab === "Search") {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${value}&include_adult=false&language=en-US&page=${currentPage}`,
          options,
        );
        const data = await response.json();
        setTotalPages(data.total_pages);
        setMovies(data.results);
        setLoading(false);
        if (data.results.length === 0 && inputRef.current!.input!.value !== "") {
          notFoundAlert.alert_message = `We can't find a movie with such name`;
          setAlert(notFoundAlert);
        } else if (inputRef.current!.input!.value === "") {
          setAlert(notFoundAlert);
        } else {
          setAlert({ show: false });
        }
      }
      if (tab === "Rated") {
        const response = await fetch(
          `https://api.themoviedb.org/3/guest_session/${session?.guest_session_id}/rated/movies?language=en-US&page=${currentPage}&sort_by=created_at.asc`,
          options,
        );
        if (response.ok) {
          const data = await response.json();
          setTotalPages(data.total_pages);
          setMovies(data.results);
          setAlert({ show: false });
        } else {
          setMovies([]);
          const error: AlertInterface = {
            show: true,
            alert_type: "Error",
            alert_message: "Sonmething went wrong",
            alert_code: `${response.status}`,
          };
          setAlert(error);
        }
      }
    };
    fetchMovies(inputRef.current!.input!.value);
  }, [currentPage, tab]);

  const fetchMovies = async (value: string) => {
    setCurrentPage(1);
    setAlert({ show: false });
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${value}&include_adult=false&language=en-US&page=1`,
      options,
    );
    const data = await response.json();
    setMovies(data.results);
    setTotalPages(data.total_pages);
    setLoading(false);
    if (data.results.length === 0) {
      notFoundAlert.alert_message = `We can't find a movie with such name`;
      setAlert(notFoundAlert);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setTab("Search");
    setAlert({ show: false });
    setLoading(true);
    setMovies([]);
    if (e.target.value === "") {
      notFoundAlert.alert_message =
        "It seems that search is empty, try to enter something and we'll find the movies.";
      setAlert(notFoundAlert);
      setLoading(false);
    }
    if (e.target.value !== "") fetchMovies(e.target.value);
  };
  const debounceSearch = useDebouncedCallback(handleInput, 1000);

  const handleTabs = (key: string) => {
    setCurrentPage(1);
    if (key === "Search") {
      setTab("Search");
    } else {
      setTab("Rated");
    }
  };

  return (
    <div className={style.movielist}>
      <TabsComponent callback={handleTabs} tab={tab} />
      <SearchInput callback={debounceSearch} ref={inputRef} />
      <NotFoundAlertComponent alert={alert} />
      <Loading loading={loading} />
      <Callback.Provider value={handleRate}>
        <Genres.Provider value={genres}>
          <RenderList movies={movies} />
        </Genres.Provider>
      </Callback.Provider>
      <PaginationComponent
        alert={alert.show}
        loading={loading}
        total={totalPages}
        current={currentPage}
        callback={handlePagination}
      />
    </div>
  );
};

export default MovieList;

import { useEffect, useState, ChangeEvent } from "react";
import {
  APIGenresAnswer,
  GuestSession,
  RateObject,
  Movie,
  AlertInterface,
  Tab,
} from "../types/types";
import { useDebouncedCallback } from "use-debounce";
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2IyNDYzMGY0MjcyZmM2MWQ0YzkxNGIzNTFiNzNhNCIsIm5iZiI6MTc0MDczMTM5MS4wOTEsInN1YiI6IjY3YzE3M2ZmMWYzZjgxYjYwN2EyMzE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Gmh5Sci3JPkNbF8Y85ap3r7DGnRpgB_k0J7L_3AuHkg",
  },
};
const ratedMovies: RateObject[] = [];

export const useMount = () => {
  const [genres, setGenres] = useState<APIGenresAnswer | null>(null);
  const [session, setSession] = useState<GuestSession>();
  useEffect(() => {
    const fetchGenres = async () => {
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
      fetchGenres();
    }
  }, []);
  const createSession = async () => {
    const fetchSession = await fetch(
      "https://api.themoviedb.org/3/authentication/guest_session/new",
      options,
    );
    const sessionRes = await fetchSession.json();
    setSession(sessionRes);
    localStorage.setItem("session", JSON.stringify(sessionRes));
  };
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
  useEffect(() => {
    const localStorageRatedMovies = localStorage.getItem("rated_movies");
    if (localStorageRatedMovies === null) return;
    const parsedRatedMovies = JSON.parse(localStorageRatedMovies);
    parsedRatedMovies.forEach((movie: RateObject) => {
      ratedMovies.push(movie);
    });
  }, []);

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
      fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}/rating?guest_session_id=${session?.guest_session_id}`,
        options,
      );
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
  return { genres, session, ratedMovies, handleRate };
};

const notFoundAlert: AlertInterface = {
  show: true,
  alert_type: "Alert",
  alert_message: "It seems that search is empty, try to enter something and we'll find the movies.",
  alert_code: "Oops...",
};

export const useSearch = (session: GuestSession | undefined) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [value, setValue] = useState<string>("");
  const [alert, setAlert] = useState<AlertInterface>(notFoundAlert);
  const [tab, setTab] = useState<Tab>("Search");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const handlePagination = (event: number) => {
    setCurrentPage(event);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setTab("Search");
    setValue(e.target.value);
  };
  const debouncedSearch = useDebouncedCallback(handleInput, 1000);

  useEffect(() => {
    setLoading(true);
    setMovies([]);
    const fetchMovies = async (value: string) => {
      if (tab === "Search") {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${value}&include_adult=false&language=en-US&page=${currentPage}`,
          options,
        );
        const data = await response.json();
        setTotalPages(data.total_pages);
        setMovies(data.results);
        if (data.results.length === 0 && value !== "") {
          notFoundAlert.alert_message = `We can't find a movie with such name`;
          setAlert(notFoundAlert);
        } else if (value === "") {
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
      setLoading(false);
    };
    fetchMovies(value);
  }, [currentPage, tab, value]);

  const handleTabs = (key: string) => {
    setCurrentPage(1);
    if (key === "Search") {
      setTab("Search");
    } else {
      setTab("Rated");
    }
  };
  return {
    loading,
    debouncedSearch,
    handlePagination,
    handleTabs,
    movies,
    alert,
    tab,
    currentPage,
    totalPages,
  };
};

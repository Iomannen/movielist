import { FC, useState, useEffect, useRef, createContext } from "react";
import "@ant-design/v5-patch-for-react-19";
import style from "./movieList.module.css";
import { SearchInput } from "./input/SearchInput";
import { ChangeEvent } from "react";
import { NotFoundAlertComponent } from "./alerts/Alert";
import { Movie, GuestSession, HandleRate, RateObject } from "../types/types.tsx";
import { RenderList } from "./renderlist/RenderList";
import { Loading } from "./loading/Loading";
import { TabsComponent } from "./tabs/Tabs.tsx";
import { InputRef } from "antd";
import { useDebouncedCallback } from "use-debounce";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2IyNDYzMGY0MjcyZmM2MWQ0YzkxNGIzNTFiNzNhNCIsIm5iZiI6MTc0MDczMTM5MS4wOTEsInN1YiI6IjY3YzE3M2ZmMWYzZjgxYjYwN2EyMzE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Gmh5Sci3JPkNbF8Y85ap3r7DGnRpgB_k0J7L_3AuHkg",
  },
};

export const Callback = createContext<HandleRate>(() => {});

const ratedMovies: RateObject[] = [];

const MovieList: FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(true);
  const [session, setSession] = useState<GuestSession>();

  const inputRef = useRef<InputRef>(null);

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
    if (check !== -1) {
      ratedMovies.splice(check, 1);
    }
    const ratedMovie: RateObject = {
      id: movie.id,
      rate: event,
    };
    if (event === 0) {
      ratedMovies.splice(check, 1);
    } else {
      ratedMovies.push(ratedMovie);
    }
    localStorage.setItem("rated_movies", JSON.stringify(ratedMovies));
    console.log(ratedMovies);
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

  const fetchRatedMovies = async () => {
    setAlert(false);
    const response = await fetch(
      `https://api.themoviedb.org/3/guest_session/${session?.guest_session_id}/rated/movies?language=en-US&page=1&sort_by=created_at.asc`,
      options,
    );
    if (response.ok) {
      const data = await response.json();
      setMovies(data.results);
    } else {
      setMovies([]);
      setAlert(true);
    }
  };

  const fetchMovies = async (value: string) => {
    setAlert(false);
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${value}&include_adult=false&language=en-US&page=1`,
      options,
    );
    const data = await response.json();
    setMovies(data.results);
    setLoading(false);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setAlert(false);
    setLoading(true);
    setMovies([]);
    if (e.target.value === "") {
      setAlert(true);
      setLoading(false);
    }
    if (e.target.value !== "") fetchMovies(e.target.value);
  };
  const debounceSearch = useDebouncedCallback(handleInput, 1000);

  const handleTabs = (key: string) => {
    if (key === "search") {
      fetchMovies(inputRef.current!.input!.value);
    } else {
      fetchRatedMovies();
    }
  };

  return (
    <div className={style.movielist}>
      <TabsComponent callback={handleTabs} />
      <SearchInput callback={debounceSearch} ref={inputRef} />
      <NotFoundAlertComponent alert={alert} />
      <Loading loading={loading} />
      <Callback.Provider value={handleRate}>
        <RenderList movies={movies} />
      </Callback.Provider>
    </div>
  );
};

export default MovieList;

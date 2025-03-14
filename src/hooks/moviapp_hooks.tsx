import { useEffect, useState } from "react";
import { APIGenresAnswer, GuestSession, RateObject, Movie } from "../types/types";

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

export const usePagination = () => {};

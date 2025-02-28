import { FC, useState, useEffect } from "react";
import "./movieList.css";
import poster from "../assets/fluffykitten.png";
import { format } from "date-fns";
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwN2IyNDYzMGY0MjcyZmM2MWQ0YzkxNGIzNTFiNzNhNCIsIm5iZiI6MTc0MDczMTM5MS4wOTEsInN1YiI6IjY3YzE3M2ZmMWYzZjgxYjYwN2EyMzE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Gmh5Sci3JPkNbF8Y85ap3r7DGnRpgB_k0J7L_3AuHkg",
  },
};
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

  useEffect(() => {
    const fetchMovies = async () => {
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
    };

    fetchMovies();
  }, []); // Пустой массив зависимостей, чтобы запрос отправлялся только один раз при монтировании

  return (
    <div className="movieList">
      {movieList.map((movie: Movie) => (
        <div className="movieCard" key={movie.id}>
          <div className="poster_half">
            <img className="movieCard__poster" src={poster}></img>
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
      ))}
    </div>
  );
};

export default MovieList;

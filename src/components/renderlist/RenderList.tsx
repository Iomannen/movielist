import { FC } from "react";
import { Movie, APIGenresAnswer, HandleRate } from "../../types/types";
import MovieCard from "./movieCard/MovieCard";

interface Props {
  movies: Movie[];
  genres: APIGenresAnswer | null;
  callback: HandleRate;
}

export const RenderList: FC<Props> = (props) => {
  const { movies, genres, callback } = props;
  return movies.map((movie: Movie) => (
    <MovieCard movie={movie} key={movie.id} genres={genres} callback={callback} />
  ));
};

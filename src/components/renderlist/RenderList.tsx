import { FC } from "react";
import { Movie } from "../../types/types";
import MovieCard from "./movieCard/MovieCard";

interface Props {
  movies: Movie[];
}

export const RenderList: FC<Props> = (props) => {
  const { movies } = props;
  return movies.map((movie: Movie) => <MovieCard movie={movie} key={movie.id} />);
};

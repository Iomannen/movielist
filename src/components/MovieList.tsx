import { FC, useRef } from "react";
import "@ant-design/v5-patch-for-react-19";
import style from "./movieList.module.css";
import { SearchInput } from "./input/SearchInput";
import { NotFoundAlertComponent } from "./alerts/Alert";
import { RenderList } from "./renderlist/RenderList";
import { Loading } from "./loading/Loading";
import { TabsComponent } from "./tabs/Tabs.tsx";
import { InputRef } from "antd";
import PaginationComponent from "./pagination/PaginationComponent.tsx";

import { useMount, useSearch } from "../hooks/moviapp_hooks.tsx";

const MovieList: FC = () => {
  const inputRef = useRef<InputRef>(null);
  const mount = useMount();
  const search = useSearch(mount.session);

  return (
    <div className={style.movielist}>
      <TabsComponent callback={search.handleTabs} tab={search.tab} />
      <SearchInput callback={search.debouncedSearch} ref={inputRef} />
      <NotFoundAlertComponent alert={search.alert} />
      <Loading loading={search.loading} />
      <RenderList movies={search.movies} callback={mount.handleRate} genres={mount.genres} />
      <PaginationComponent
        alert={search.alert.show}
        loading={search.loading}
        total={search.totalPages}
        current={search.currentPage}
        callback={search.handlePagination}
      />
    </div>
  );
};

export default MovieList;

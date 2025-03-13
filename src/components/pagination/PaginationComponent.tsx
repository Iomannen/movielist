import { FC } from "react";
import style from "../movieList.module.css";
import { Pagination, ConfigProvider } from "antd";
interface Props {
  alert: boolean;
  loading: boolean;
  total: number;
  current: number;
  callback: (event: number) => void;
}
const PaginationComponent: FC<Props> = (props) => {
  const { alert, loading, total, current, callback } = props;
  return (
    <ConfigProvider
      theme={{
        components: {
          Pagination: {
            itemActiveBg: "#1890FF",
            itemBg: "#33333C",
            colorText: "#FFFFFF",
            itemInputBg: "#FFFFFF",
          },
        },
      }}
    >
      <Pagination
        defaultCurrent={1}
        current={current}
        total={total}
        onChange={callback}
        showSizeChanger={false}
        pageSize={1}
        hideOnSinglePage={true}
        className={`${style.pagination} ${loading ? style.hide : ""} ${alert ? style.hide : ""}`}
      />
    </ConfigProvider>
  );
};

export default PaginationComponent;

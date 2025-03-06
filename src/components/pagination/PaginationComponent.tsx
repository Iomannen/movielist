import { FC } from "react";
import style from "../movieList.module.css";
import { Pagination, ConfigProvider } from "antd";

interface Props {
  hide: boolean;
  page: number;
  total: number;
  onChange: (page: number) => void;
}
const PaginationComponent: FC<Props> = (props) => {
  const { hide, page, total, onChange } = props;
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
        current={page}
        total={total}
        onChange={onChange}
        showSizeChanger={false}
        hideOnSinglePage={true}
        showTitle={false}
        className={hide ? style.hide : ""}
      />
    </ConfigProvider>
  );
};

export default PaginationComponent;

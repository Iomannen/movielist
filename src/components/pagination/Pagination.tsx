import { FC } from "react";
import { Pagination, ConfigProvider } from "antd";

interface Props {
  page: number;
  total: number;
  onChange: (page: number) => void;
}
const PaginationComponent: FC<Props> = (props) => {
  const { page, total, onChange } = props;
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
      />
    </ConfigProvider>
  );
};

export default PaginationComponent;

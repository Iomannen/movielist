import { FC } from "react";

import { Pagination, ConfigProvider } from "antd";
interface Props {
  total: number;
  callback: (event: number) => void;
}
const PaginationComponent: FC<Props> = (props) => {
  const { total, callback } = props;
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
      <Pagination defaultCurrent={1} total={total} onChange={callback} />
    </ConfigProvider>
  );
};

export default PaginationComponent;

import { FC } from "react";
import { Tabs } from "antd";

const items: TabsProps["items"] = [
  {
    key: "search",
    label: "Search",
  },
  {
    key: "rated",
    label: "Rated",
  },
];
interface Props {
  callback: () => void;
}
export const TabsComponent: FC<Props> = (props) => {
  const { callback } = props;

  return <Tabs items={items} onChange={callback} />;
};

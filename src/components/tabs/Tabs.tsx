import { FC } from "react";
import { Tabs, TabsProps } from "antd";
import { Tab } from "../../types/types";

const items: TabsProps["items"] = [
  {
    key: "Search",
    label: "Search",
  },
  {
    key: "Rated",
    label: "Rated",
  },
];
interface Props {
  callback: (key: string) => void;
  tab: Tab;
}
export const TabsComponent: FC<Props> = (props) => {
  const { callback, tab } = props;

  return <Tabs items={items} onChange={callback} activeKey={tab} />;
};

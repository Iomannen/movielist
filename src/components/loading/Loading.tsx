import { FC } from "react";
import { Spin } from "antd";
import style from "../movieList.module.css";

interface Props {
  loading: boolean;
}

export const Loading: FC<Props> = (props) => {
  const { loading } = props;
  return loading ? <Spin className={style.alert} size="large"></Spin> : "";
};

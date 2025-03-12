import { FC } from "react";
import { Alert } from "antd";
import style from "../movieList.module.css";
interface Props {
  alert: boolean;
}

export const NotFoundAlertComponent: FC<Props> = (props) => {
  const { alert } = props;
  return alert ? (
    <Alert
      message="Oops"
      description="It seems that search is empty, try to enter something and we'll find the movies."
      type="info"
      className={style.alert}
    />
  ) : (
    ""
  );
};

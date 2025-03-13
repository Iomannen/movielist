import { FC } from "react";
import { Alert } from "antd";
import style from "../movieList.module.css";
import { AlertInterface } from "../../types/types";
interface Props {
  alert: AlertInterface;
}

export const NotFoundAlertComponent: FC<Props> = (props) => {
  const { alert } = props;

  return alert.show ? (
    <Alert
      message={alert.alert_code}
      description={alert.alert_message}
      type={alert.alert_type === "Error" ? "error" : "info"}
      className={style.alert}
    />
  ) : (
    ""
  );
};

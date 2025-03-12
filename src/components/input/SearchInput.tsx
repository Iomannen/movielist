import { forwardRef } from "react";
import { Input, InputRef } from "antd";

interface Props {
  callback: () => void;
}

export const SearchInput = forwardRef<InputRef, Props>((props, ref) => {
  const { callback } = props;
  return <Input onChange={callback} ref={ref} />;
});

import { forwardRef, ChangeEvent } from "react";
import { Input, InputRef } from "antd";

interface Props {
  callback: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput = forwardRef<InputRef, Props>((props, ref) => {
  const { callback } = props;
  return <Input onChange={callback} ref={ref} />;
});

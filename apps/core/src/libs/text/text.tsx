import React from "react";
import { Text as TextLib } from "ink";

interface TextProps {
  children?: React.ReactNode
}

export const Text = (props: TextProps) => {
  const { children } = props;
  return (
    <TextLib >
      {children}
    </TextLib>
  );
};

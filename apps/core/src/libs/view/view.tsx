import React from "react";
import { Box } from "ink";

interface ViewProps {
  children: React.ReactNode;
  style: {
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  }
}

export const View = (props: ViewProps) => {
  const { children } = props;
  return (
    <Box flexDirection={props.style.flexDirection || 'column'}>
      {children}
    </Box>
  );
}
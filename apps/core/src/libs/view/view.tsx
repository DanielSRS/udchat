import React from "react";
import { Box } from "ink";

interface ViewProps {
  children: React.ReactNode;
  style?: {
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
    flexBasis?: string | number | undefined;
    flexGrow?: number | undefined;
    flexShrink?: number | undefined;
    padding?: number | undefined;
    paddingTop?: number | undefined;
    paddingBottom?: number | undefined;
    paddingLeft?: number | undefined;
    paddingRight?: number | undefined;
    paddingHorizontal?: number | undefined;
    paddingVertical?: number | undefined;
    borderStyle?: 'arrow' | 'bold' | 'classic' | 'double' | 'doubleSingle' | 'single' | 'round' | 'singleDouble';
    borderColor?: 'black' | 'blue' | 'cyan' | 'gray' | 'green' | 'grey' | 'magenta' | 'red' |'white' | 'yellow'
    |'blackBright' | 'blueBright' | 'cyanBright' | 'greenBright' | 'magentaBright' | 'redBright' |'whiteBright' | 'yellowBright';
    height?: string | number | undefined;
    width?: string | number | undefined;
    overflow?: "visible" | "hidden" | undefined;
    justifyContent?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around";
    alignItems?: "center" | "flex-start" | "flex-end" | "stretch";
    alignSelf?: "center" | "flex-start" | "flex-end" | "auto";
  }
}

export const View = (props: ViewProps) => {
  const { children, style } = props;
  return (
    <Box
      flexDirection={props?.style?.flexDirection || 'column'}
      {...style}
      paddingX={style?.paddingHorizontal}
      paddingY={style?.paddingVertical}
      overflow={style?.overflow || 'hidden'}
    >
      {children}
    </Box>
  );
}
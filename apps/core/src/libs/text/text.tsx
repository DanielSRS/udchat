import React from "react";
import { Text as TextLib } from "ink";

interface TextProps {
  children?: string;
  style?: {
    fontWeight?: "bold";
    fontStyle?: "italic";
    backgroundColor?: 'black' | 'blue' | 'cyan' | 'gray' | 'green' | 'grey' | 'magenta' | 'red' |'white' | 'yellow'
    |'blackBright' | 'blueBright' | 'cyanBright' | 'greenBright' | 'magentaBright' | 'redBright' |'whiteBright' | 'yellowBright';
    color?: 'black' | 'blue' | 'cyan' | 'gray' | 'green' | 'grey' | 'magenta' | 'red' |'white' | 'yellow'
    |'blackBright' | 'blueBright' | 'cyanBright' | 'greenBright' | 'magentaBright' | 'redBright' |'whiteBright' | 'yellowBright';
    textDecorationLine?: "underline" | "line-through";
    textTransform?: "lowercase" | "uppercase";
  };
}

export const Text = (props: TextProps) => {
  const { children, style } = props;
  const transformedText = !style?.textTransform ? children : (
    style.textTransform === 'uppercase'
      ? children?.toUpperCase()
      : children?.toLowerCase()
  );
  return (
    <TextLib
      bold={style?.fontWeight === 'bold' }
      italic={style?.fontStyle === 'italic'}
      underline={style?.textDecorationLine === 'underline'}
      strikethrough={style?.textDecorationLine === 'line-through'}
    >
      {transformedText}
    </TextLib>
  );
};

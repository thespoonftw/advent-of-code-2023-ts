import React, { ReactNode } from 'react';

export const ADashedLine: React.FC<{ length: number }> = ({ length }) => {
  return (
    <div>{String("").padStart(length, '-')}</div>
  );
};

export const AHeader: React.FC<{ text: string | number, length?: number }> = ({ text, length }) => {
  return (
    <b>&nbsp;{String(text).padEnd(length ? length - 2 : 0, '\u00A0')}&nbsp;</b>
  )
}

export const ACell: React.FC<{ text: string | number, length?: number }> = ({ text, length }) => {
  return (
    <>&nbsp;{String(text).padEnd(length ? length - 2 : 0, '\u00A0')}&nbsp;</>
  )
}

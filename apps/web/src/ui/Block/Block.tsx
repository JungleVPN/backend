import { Paper, type PaperProps } from '@mantine/core';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren & PaperProps;

export const Block = ({ children, shadow = 'md', radius = 'xl', p = 'lg', ...props }: Props) => {
  return (
    <Paper
      {...props}
      shadow={shadow}
      radius={radius}
      p={p}
      withBorder
      style={{
        backgroundColor: 'rgb(26, 27, 30)',
        border: '1px solid oklch(0.4676 0 0)',
        gap: '1rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Paper>
  );
};

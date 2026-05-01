import { Surface } from '@heroui/react';
import type { ColorGradientStyle } from '../../utils/colorParser';

interface IProps {
  getIconFromLibrary: (iconKey: string) => string;
  gradientStyle: ColorGradientStyle;
  svgIconColor: string;
  svgIconKey: string;
}

export const ThemeIconComponent = (props: IProps) => {
  const { svgIconColor, gradientStyle, svgIconKey, getIconFromLibrary } = props;

  return (
    <Surface
      className='size-9 shrink-0 rounded-full'
      style={{
        background: gradientStyle.background,
        border: gradientStyle.border,
        boxShadow: gradientStyle.boxShadow,
        color: svgIconColor,
      }}
      variant='transparent'
    >
      <span
        className='flex size-full items-center justify-center [&_svg]:size-[18px]'
        dangerouslySetInnerHTML={{
          __html: getIconFromLibrary(svgIconKey),
        }}
      />
    </Surface>
  );
};

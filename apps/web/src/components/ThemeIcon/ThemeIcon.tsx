import { ThemeIcon } from '@mantine/core';
import type { ColorGradientStyle } from '@/utils/colorParser';

interface IProps {
  getIconFromLibrary: (iconKey: string) => string;
  gradientStyle: ColorGradientStyle;
  svgIconColor: string;
  svgIconKey: string;
}
export const ThemeIconComponent = (props: IProps) => {
  const { svgIconColor, gradientStyle, svgIconKey, getIconFromLibrary } = props;

  return (
    <ThemeIcon
      color={svgIconColor}
      radius="xl"
      size={36}
      style={{
        background: gradientStyle.background,
        border: gradientStyle.border,
        boxShadow: gradientStyle.boxShadow,
        flexShrink: 0,
      }}
      variant="light"
    >
      <span
        dangerouslySetInnerHTML={{
          __html: getIconFromLibrary(svgIconKey),
        }}
        style={{ display: 'flex', alignItems: 'center' }}
      />
    </ThemeIcon>
  );
};

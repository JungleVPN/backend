import { Box, Group, Stack, Text } from '@mantine/core';

import type { IBlockRendererProps } from '../rendererBlock.interface';
import classes from './minimalBlock.module.css';
import { ThemeIconComponent } from '@/components/ThemeIcon/ThemeIcon';
import { getColorGradient } from '@/utils/colorParser';
import { getLocalizedText } from '@/utils/configParser';

export const MinimalBlockRenderer = ({
  blocks,
  currentLang,
  renderBlockButtons,
  getIconFromLibrary,
}: IBlockRendererProps) => {
  return (
    <Stack gap="md" style={{ zIndex: 3 }}>
      {blocks.map((block, index) => {
        const gradientStyle = getColorGradient(block.svgIconColor);

        return (
          <Box className={classes.stepBlock} key={index}>
            <Group gap="sm" mb="xs" wrap="nowrap">
              <ThemeIconComponent
                getIconFromLibrary={getIconFromLibrary}
                gradientStyle={gradientStyle}
                svgIconColor={block.svgIconColor}
                svgIconKey={block.svgIconKey}
              />
              <Text
                c="white"
                dangerouslySetInnerHTML={{
                  __html: getLocalizedText(block.title, currentLang),
                }}
                fw={500}
                size={'sm'}
              />
            </Group>
            <Text
              c="dimmed"
              dangerouslySetInnerHTML={{
                __html: getLocalizedText(block.description, currentLang),
              }}
              size={'xs'}
              style={{ lineHeight: 1.6 }}
            />
            {block.buttons.length > 0 && (
              <Box style={{ marginTop: 8 }}>
                {renderBlockButtons(block.buttons, 'subtle')}
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

import { Stack, Text, Timeline } from '@mantine/core';

import type { IBlockRendererProps } from '../rendererBlock.interface';
import classes from './timelineBlock.module.css';
import { ThemeIconComponent } from '@/components/ThemeIcon/ThemeIcon';
import { getColorGradientSolid } from '@/utils/colorParser';
import { getLocalizedText } from '@/utils/configParser';

export const TimelineBlockRenderer = ({
  blocks,
  currentLang,
  renderBlockButtons,
  getIconFromLibrary,
}: IBlockRendererProps) => {
  return (
    <Timeline
      active={blocks.length}
      bulletSize={36}
      classNames={{
        root: classes.timelineRoot,
        item: classes.timelineItem,
        itemBullet: classes.timelineItemBullet,
      }}
      color="cyan"
      lineWidth={2}
      style={{ zIndex: 3 }}
    >
      {blocks.map((block, index) => {
        const gradientStyle = getColorGradientSolid(block.svgIconColor);

        return (
          <Timeline.Item
            bullet={
              <ThemeIconComponent
                getIconFromLibrary={getIconFromLibrary}
                gradientStyle={gradientStyle}
                svgIconColor={block.svgIconColor}
                svgIconKey={block.svgIconKey}
              />
            }
            key={index}
            title={
              <Text
                c="white"
                dangerouslySetInnerHTML={{
                  __html: getLocalizedText(block.title, currentLang),
                }}
                fw={600}
                size={'sm'}
              />
            }
          >
            <Stack gap="xs">
              <Text
                c="dimmed"
                dangerouslySetInnerHTML={{
                  __html: getLocalizedText(block.description, currentLang),
                }}
                size={'xs'}
                style={{ lineHeight: 1.6 }}
              />
              {renderBlockButtons(block.buttons, 'light')}
            </Stack>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

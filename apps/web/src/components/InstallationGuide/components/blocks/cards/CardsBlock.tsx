import { Card, Group, Stack, Text, Title } from '@mantine/core';

import type { IBlockRendererProps } from '../rendererBlock.interface';
import { ThemeIconComponent } from '@/components/ThemeIcon/ThemeIcon';
import { getColorGradient } from '@/utils/colorParser';
import { getLocalizedText } from '@/utils/configParser';

export const CardsBlockRenderer = ({
  blocks,
  currentLang,
  renderBlockButtons,
  getIconFromLibrary,
}: IBlockRendererProps) => {
  return (
    <Stack gap="sm" style={{ zIndex: 3 }}>
      {blocks.map((block, index) => {
        const gradientStyle = getColorGradient(block.svgIconColor);

        return (
          <Card
            className="step-card"
            key={index}
            p={{ base: 'sm', xs: 'md', sm: 'lg' }}
            radius="lg"
          >
            <Group align="flex-start" gap={'sm'} wrap="nowrap">
              <ThemeIconComponent
                getIconFromLibrary={getIconFromLibrary}
                gradientStyle={gradientStyle}
                svgIconColor={block.svgIconColor}
                svgIconKey={block.svgIconKey}
              />
              <Stack gap={'xs'} style={{ flex: 1, minWidth: 0 }}>
                <Title
                  c="white"
                  fw={600}
                  order={6}
                  style={{ wordBreak: 'break-word' }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: getLocalizedText(block.title, currentLang),
                    }}
                  />
                </Title>

                <Text
                  size={'xs'}
                  style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: getLocalizedText(block.description, currentLang),
                    }}
                  />
                </Text>

                {renderBlockButtons(block.buttons, 'light')}
              </Stack>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
};

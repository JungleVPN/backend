import { Accordion, Group, Stack, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';

import type { IBlockRendererProps } from '../rendererBlock.interface';
import classes from './AccordionBlock.module.css';
import { vibrate } from '@/utils/vibrate';
import { getColorGradient } from '@/utils/colorParser';
import { getLocalizedText } from '@/utils/configParser';
import { ThemeIconComponent } from '@/components/ThemeIcon/ThemeIcon';

export const AccordionBlockRenderer = ({
  blocks,
  currentLang,
  renderBlockButtons,
  getIconFromLibrary,
}: IBlockRendererProps) => {
  const [openedAccordion, setOpenedAccordion] = useState<null | string>('0');

  return (
    <Accordion
      chevron={<IconChevronDown size={18} />}
      classNames={{
        item: classes.accordionItem,
        control: classes.accordionControl,
        chevron: classes.accordionChevron,
        content: classes.accordionContent,
        label: classes.accordionLabel,
      }}
      onChange={(value) => {
        vibrate('tap');
        setOpenedAccordion(value);
      }}
      radius="lg"
      style={{ zIndex: 3 }}
      transitionDuration={200}
      value={openedAccordion}
      variant="separated"
    >
      {blocks.map((block, index) => {
        const gradientStyle = getColorGradient(block.svgIconColor);

        return (
          <Accordion.Item key={index} value={String(index)}>
            <Accordion.Control>
              <Group gap="sm" wrap="nowrap">
                <ThemeIconComponent
                  getIconFromLibrary={getIconFromLibrary}
                  gradientStyle={gradientStyle}
                  svgIconColor={block.svgIconColor}
                  svgIconKey={block.svgIconKey}
                />
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    c="white"
                    dangerouslySetInnerHTML={{
                      __html: getLocalizedText(block.title, currentLang),
                    }}
                    fw={600}
                    size={'sm'}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  />
                </Stack>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Text
                c="dimmed"
                dangerouslySetInnerHTML={{
                  __html: getLocalizedText(block.description, currentLang),
                }}
                size={'xs'}
                style={{ lineHeight: 1.7 }}
              />
              <Group gap="xs" mt="sm" wrap="wrap">
                {renderBlockButtons(block.buttons, 'light')}
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
};

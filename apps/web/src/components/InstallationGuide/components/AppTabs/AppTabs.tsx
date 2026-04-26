import { Surface, Tabs } from '@heroui/react';
import type { TSubscriptionPageAppConfig } from '@workspace/types';
import clsx from 'clsx';
import { getIconFromLibrary } from '@/utils/configParser';
import { vibrate } from '@/utils/vibrate';
import classes from '../../InstallationGuide.module.css';

interface AppTabsProps {
  platformApps: TSubscriptionPageAppConfig[];
  platformId: string;
  selectedAppIndex: number;
  svgLibrary: Record<string, string>;
  onAppChange: (index: number) => void;
}

export function AppTabs({
  platformApps,
  platformId,
  selectedAppIndex,
  svgLibrary,
  onAppChange,
}: AppTabsProps) {
  if (platformApps.length === 0) return null;

  const appIds = platformApps.map((app) => `${platformId}:${app.name}`);
  const safeIndex =
    selectedAppIndex >= 0 && selectedAppIndex < platformApps.length ? selectedAppIndex : 0;

  return (
    <Surface variant='transparent'>
      <Tabs
        key={platformId}
        selectedKey={appIds[safeIndex]}
        variant='primary'
        onSelectionChange={(key) => {
          if (key == null) return;
          const nextIndex = appIds.indexOf(String(key));
          if (nextIndex < 0) return;
          vibrate('toggle');
          onAppChange(nextIndex);
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label='Apps'>
            {platformApps.map((app, index) => {
              const isActive = index === safeIndex;
              return (
                <Tabs.Tab
                  key={appIds[index]}
                  id={appIds[index]}
                  className={clsx(
                    isActive && classes.appButtonActive,
                    app.featured && classes.appButtonFeatured,
                  )}
                >
                  {app.featured ? <span className={classes.featuredBadge} /> : null}
                  {app.svgIconKey ? (
                    <span
                      className={clsx(classes.bgIcon, isActive && classes.bgIconActive)}
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted SVG icon string
                      dangerouslySetInnerHTML={{
                        __html: getIconFromLibrary(app.svgIconKey, svgLibrary),
                      }}
                    />
                  ) : null}
                  <span className={classes.appName}>{app.name}</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </Surface>
  );
}

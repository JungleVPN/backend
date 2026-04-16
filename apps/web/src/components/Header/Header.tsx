import { Group, Image, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Block } from '@/ui/Block/Block';
import { AuthButtons } from './AuthButtons';
import { LanguageSwitcher } from './LanguageSwitcher';
import css from './header.module.css';

export function Header() {
  return (
    <Block className={css.container} radius={'lg'} px={0} p={'sm'}>
      <Group justify="space-between" px={{ base: 'md', sm: 'lg', md: 'xl' }}>
        <Group gap="xs">
          <Link to="/">
            <Image
              alt="JungleVPN_logo"
              fit="contain"
              src={'/assets/Logo.svg'}
              style={{
                width: '64px',
                height: '64px',
                flexShrink: 0,
              }}
            />
          </Link>
          <Title c={'white'} fw={700} order={4} size="lg">
            JungleVPN
          </Title>
        </Group>

        <Group gap="md">
          <LanguageSwitcher />
          <AuthButtons />
        </Group>
      </Group>
    </Block>
  );
}

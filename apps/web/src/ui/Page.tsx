import { Surface } from '@heroui/react';
import { PropsWithChildren } from 'react';

interface PageProps extends PropsWithChildren {
  icon?: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export const Page = (props: PageProps) => {
  const { icon, title, subtitle, description, children } = props;

  return (
    <Surface variant={'transparent'} className={'flex items-center justify-center flex-col'}>
      <img src={icon} alt={title} className={'w-[144px] h-[144px] mx-auto'} />
      <p className={'text-2xl mt-1'}>{title}</p>
      <p className={'text-md text-muted m-1'}>{subtitle}</p>
      <p className={'text-sm text-muted'}>{description}</p>
      <div className={'mt-5 py-6 flex items-center justify-center flex-col w-full'}>{children}</div>
    </Surface>
  );
};

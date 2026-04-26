import { Surface } from '@heroui/react';

interface CardCustomProps {
  title?: string;
  contentTitle?: string;
  content: string;
}

export const CardCustom = (props: CardCustomProps) => {
  const { title, contentTitle, content } = props;

  return (
    <div className='flex flex-col gap-1'>
      <p className='text-sm font-medium text-muted pl-4'>{title}</p>
      <Surface
        className='flex min-w-[320px] flex-col {{ contentTitle ? "gap-1" : "gap-0"}} rounded-4xl p-4'
        variant='default'
      >
        <h3 className='text-base font-semibold text-foreground'>{contentTitle}</h3>
        <p className='text-sm text-muted'>{content}</p>
      </Surface>
    </div>
  );
};

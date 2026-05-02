import { type FC, type JSX } from 'react';
import { Link as RouterLink } from 'react-router';

export interface LinkProps extends Omit<JSX.IntrinsicElements['a'], 'href'> {
  href: string;
  target?: string;
}

/**
 * Universal Link component.
 * - External URLs (`http:`/`https:`) render as `<a>`.
 * - `target="_blank"` forces `<a>` — avoid that for in-app paths (e.g. `/terms`): memory routers
 *   have no real URL, so a plain `<a>` triggers full navigation instead of `<RouterLink>`.
 * - Otherwise paths use React Router `<RouterLink>`.
 */
export const Link: FC<LinkProps> = ({ className, onClick, href, target, children, ...rest }) => {
  const isExternal = href.startsWith('http') || target === '_blank';

  if (isExternal) {
    return (
      <a
        {...rest}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink {...rest} to={href} onClick={onClick} className={className}>
      {/*@ts-ignore*/}
      {children}
    </RouterLink>
  );
};

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When `"true"`, mock Telegram launch params if missing (e.g. tunnel URL in a normal browser). */
  readonly VITE_MOCK_TMA_OUTSIDE_TELEGRAM?: string;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import type { FunctionComponent, SVGAttributes } from 'react';
  const ReactComponent: FunctionComponent<SVGAttributes<SVGElement>>;
  export default ReactComponent;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

/// <reference types="vite/client" />
/// <reference types="node" />

// React declarations
declare module 'react' {
  namespace React {
    type ReactNode = import('react').ReactNode;
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    interface Component<P = {}, S = {}, SS = any> {}
    type JSXElementConstructor<P> = any;
    type Key = string | number;
    
    // Components
    const Fragment: any;
    const Suspense: any;
    
    // Hooks
    function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
    function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
    function useRef<T>(initialValue: T): { current: T };
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
    function useMemo<T>(factory: () => T, deps: readonly any[]): T;
    
    // Functions
    function lazy<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>): T;
    function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  }
  
  export = React;
  export as namespace React;
}

declare module 'react-dom' {
  const ReactDOM: {
    render(element: React.ReactNode, container: Element | null): void;
    unmountComponentAtNode(container: Element): boolean;
    createPortal(children: React.ReactNode, container: Element): React.ReactPortal;
    hydrate(element: React.ReactNode, container: Element | null): void;
  };
  export = ReactDOM;
  export as namespace ReactDOM;
}

// React JSX runtime declarations
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// Declare react-router and react-router-dom modules
declare module 'react-router' {
  export interface RouteObject {
    path?: string;
    element?: React.ReactNode;
    children?: RouteObject[];
    index?: boolean;
    caseSensitive?: boolean;
    id?: string;
  }
}

declare module 'react-router-dom' {
  export * from 'react-router';
  export const Outlet: any;
  export const createBrowserRouter: any;
}

// Vite-related module declarations
declare module '@vitejs/plugin-react' {
  const plugin: any;
  export default plugin;
}

declare module 'vite-plugin-html-inject' {
  const plugin: any;
  export default plugin;
}

declare module 'vite-tsconfig-paths' {
  const plugin: any;
  export default plugin;
}

// Global variable declarations
declare global {
  const process: {
    env: Record<string, string>;
  };
  const __dirname: string;
}

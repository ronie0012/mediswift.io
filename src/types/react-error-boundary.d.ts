declare module 'react-error-boundary' {
  import { ComponentType, ReactNode } from 'react';

  interface FallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
  }

  interface ErrorBoundaryProps {
    FallbackComponent: ComponentType<FallbackProps>;
    children: ReactNode;
  }

  export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {}
} 
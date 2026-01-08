import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ApiKeysProvider } from '../../contexts/ApiKeysContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withApiKeys?: boolean;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  { withApiKeys = true, ...options }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    if (withApiKeys) {
      return <ApiKeysProvider>{children}</ApiKeysProvider>;
    }
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };

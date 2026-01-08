# Testing Guide

## Running Tests

The project uses **Vitest** for testing, **React Testing Library** for component testing, and **jsdom** for DOM simulation.

### Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI (interactive mode)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Test Files Location
Tests are colocated with their source files:
- Component tests: `components/*.test.tsx`
- Service tests: `services/*.test.ts`
- Context tests: `contexts/*.test.tsx`

### Test Utilities
- **Test setup**: `test/setup.ts` - Global test configuration and mocks
- **Test utilities**: `test/utils/test-utils.tsx` - Custom render functions with providers
- **Mock data**: `test/fixtures/mockData.ts` - Reusable test fixtures
- **Mocks**: `test/mocks/` - Module mocks for external dependencies

## Writing Tests

### Component Testing Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/utils/test-utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Service Testing Example
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myService } from './myService';

describe('myService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process data', async () => {
    const result = await myService.process('input');
    expect(result).toBe('expected');
  });
});
```

## Test Coverage

Coverage reports are generated in the `coverage/` directory (git-ignored).

Target coverage thresholds:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Security Testing

Tests verify:
- API keys are never logged
- Input sanitization (XSS prevention)
- Error handling for API failures
- Secure localStorage usage

## Mocking Strategy

### API Mocking
The Gemini API is mocked in tests to avoid:
- Real API calls during testing
- Requirement for API keys
- Network latency

### localStorage Mocking
localStorage is mocked globally in `test/setup.ts`.

### IndexedDB Mocking
Dexie/IndexedDB is mocked for contexts that use it.

## Continuous Integration

Tests are designed to run in CI environments with:
- No external dependencies
- No real API calls
- Fast execution (<10 seconds target)
- Deterministic results

## Troubleshooting

### "IndexedDB API missing" Error
This is expected in tests - IndexedDB is mocked in `test/setup.ts`.

### Test Timeout
Increase timeout for slow tests:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Flaky Tests
Use `waitFor` for async operations:
```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

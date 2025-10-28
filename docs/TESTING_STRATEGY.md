# Testing Strategy

## Overview
This document outlines the comprehensive testing strategy for the Task WebApp Frontend, with special focus on the modular architecture patterns established in the Punchin feature refactoring.

## 🧪 Testing Philosophy

### Testing Pyramid
```
                    E2E Tests
                  (Integration)
                /               \
              /                   \
            /                       \
          /                           \
    Integration Tests               Unit Tests
   (Component + Hook)              (Individual)
```

### Testing Principles
1. **Test Behavior, Not Implementation**: Focus on what components do, not how they do it
2. **Modular Testing**: Each component and hook should be testable in isolation
3. **User-Centric**: Write tests from the user's perspective
4. **Maintainable**: Tests should be easy to understand and maintain
5. **Fast Feedback**: Unit tests should run quickly for rapid development

## 📋 Testing Levels

### 1. Unit Tests (70% of tests)

#### Component Unit Tests
```jsx
// Example: CustomerSelectionStep.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerSelectionStep from './CustomerSelectionStep';

describe('CustomerSelectionStep', () => {
  const mockCustomers = [
    { id: 1, firm_name: 'Customer A', latitude: 10, longitude: 20 },
    { id: 2, firm_name: 'Customer B', latitude: 30, longitude: 40 }
  ];

  const defaultProps = {
    customers: mockCustomers,
    selectedCustomer: null,
    setSelectedCustomer: jest.fn(),
    onNext: jest.fn(),
    isLoading: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders customer selection interface', () => {
      render(<CustomerSelectionStep {...defaultProps} />);
      
      expect(screen.getByText('Select Customer')).toBeInTheDocument();
      expect(screen.getByText('Customer *')).toBeInTheDocument();
      expect(screen.getByText('Select a customer')).toBeInTheDocument();
    });

    test('displays error message when provided', () => {
      render(<CustomerSelectionStep {...defaultProps} error="Failed to load customers" />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load customers')).toBeInTheDocument();
    });

    test('shows loading state', () => {
      render(<CustomerSelectionStep {...defaultProps} isLoading={true} />);
      
      // Open dropdown to see loading state
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Loading customers...')).toBeInTheDocument();
    });
  });

  describe('Customer Selection', () => {
    test('opens dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<CustomerSelectionStep {...defaultProps} />);
      
      const dropdown = screen.getByRole('combobox');
      await user.click(dropdown);
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Customer A')).toBeInTheDocument();
      expect(screen.getByText('Customer B')).toBeInTheDocument();
    });

    test('filters customers based on search', async () => {
      const user = userEvent.setup();
      render(<CustomerSelectionStep {...defaultProps} />);
      
      // Open dropdown
      await user.click(screen.getByRole('combobox'));
      
      // Search for specific customer
      const searchInput = screen.getByPlaceholderText('Search customers...');
      await user.type(searchInput, 'Customer A');
      
      await waitFor(() => {
        expect(screen.getByText('Customer A')).toBeInTheDocument();
        expect(screen.queryByText('Customer B')).not.toBeInTheDocument();
      });
    });

    test('selects customer and calls setSelectedCustomer', async () => {
      const user = userEvent.setup();
      render(<CustomerSelectionStep {...defaultProps} />);
      
      // Open dropdown and select customer
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Customer A'));
      
      expect(defaultProps.setSelectedCustomer).toHaveBeenCalledWith(mockCustomers[0]);
    });

    test('enables next button only when valid customer selected', () => {
      const selectedCustomer = mockCustomers[0];
      render(<CustomerSelectionStep {...defaultProps} selectedCustomer={selectedCustomer} />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });

    test('disables next button when customer has no location', () => {
      const customerWithoutLocation = { id: 3, firm_name: 'No Location Customer' };
      render(<CustomerSelectionStep {...defaultProps} selectedCustomer={customerWithoutLocation} />);
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<CustomerSelectionStep {...defaultProps} />);
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-expanded', 'false');
      expect(dropdown).toHaveAttribute('aria-haspopup', 'listbox');
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CustomerSelectionStep {...defaultProps} />);
      
      const dropdown = screen.getByRole('combobox');
      dropdown.focus();
      
      // Test escape key closes dropdown
      await user.keyboard('{Enter}'); // Open dropdown
      await user.keyboard('{Escape}'); // Close dropdown
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
```

#### Hook Unit Tests
```jsx
// Example: useLocationMap.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import useLocationMap from './useLocationMap';

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('useLocationMap', () => {
  const mockCustomer = {
    id: 1,
    latitude: 10.123,
    longitude: 20.456
  };

  const mockImage = { url: 'test-image.jpg' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useLocationMap(mockCustomer, mockImage));
    
    expect(result.current.capturedLocation).toBeNull();
    expect(result.current.distance).toBe("");
    expect(result.current.locationError).toBeNull();
    expect(result.current.isGettingLocation).toBe(false);
  });

  test('fetches location successfully', async () => {
    const mockPosition = {
      coords: {
        latitude: 10.125,
        longitude: 20.458,
        accuracy: 10
      }
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useLocationMap(mockCustomer, mockImage));
    
    act(() => {
      result.current.getLocation();
    });

    expect(result.current.isGettingLocation).toBe(true);

    await waitFor(() => {
      expect(result.current.isGettingLocation).toBe(false);
      expect(result.current.capturedLocation).toEqual({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
        accuracy: mockPosition.coords.accuracy,
        timestamp: expect.any(Number)
      });
    });
  });

  test('handles location error', async () => {
    const mockError = new Error('Location access denied');
    
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useLocationMap(mockCustomer, mockImage));
    
    act(() => {
      result.current.getLocation();
    });

    await waitFor(() => {
      expect(result.current.isGettingLocation).toBe(false);
      expect(result.current.locationError).toBe('Location access denied');
    });
  });

  test('calculates distance correctly', async () => {
    // Mock successful location fetch
    const mockPosition = {
      coords: { latitude: 10.200, longitude: 20.500, accuracy: 10 }
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useLocationMap(mockCustomer, mockImage));
    
    act(() => {
      result.current.getLocation();
    });

    await waitFor(() => {
      expect(result.current.distance).toBeDefined();
      expect(typeof result.current.distance).toBe('string');
    });
  });
});
```

### 2. Integration Tests (20% of tests)

#### Component Integration Tests
```jsx
// Example: PunchinWizard.integration.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Punchin from './Punchin';
import { store } from '../../../store/store';

// Mock API calls
jest.mock('../services/punchService', () => ({
  PunchAPI: {
    getFirms: jest.fn(),
    punchIn: jest.fn()
  }
}));

const TestWrapper = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('Punchin Wizard Integration', () => {
  test('completes full wizard flow', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    require('../services/punchService').PunchAPI.getFirms.mockResolvedValue({
      firms: [
        { id: 1, firm_name: 'Test Customer', latitude: 10, longitude: 20 }
      ]
    });

    render(
      <TestWrapper>
        <Punchin />
      </TestWrapper>
    );

    // Step 1: Customer Selection
    await waitFor(() => {
      expect(screen.getByText('Select Customer')).toBeInTheDocument();
    });

    // Select customer
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Test Customer'));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Photo Capture
    await waitFor(() => {
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
    });

    // Mock photo capture (would need to mock camera in real test)
    // For now, we'll assume photo is captured
    
    // Step 3: Location Capture
    // Mock location services and map initialization
    
    // Step 4: Confirmation
    // Verify all data is displayed correctly
    
    // Submit punch-in
    // Verify API call is made with correct data
  });

  test('handles wizard navigation correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Punchin />
      </TestWrapper>
    );

    // Test forward and backward navigation
    // Verify step progress updates correctly
    // Ensure data persistence across steps
  });

  test('handles error states gracefully', async () => {
    // Mock API failure
    require('../services/punchService').PunchAPI.getFirms.mockRejectedValue(
      new Error('Network error')
    );

    render(
      <TestWrapper>
        <Punchin />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch customers/i)).toBeInTheDocument();
    });
  });
});
```

### 3. End-to-End Tests (10% of tests)

#### Cypress E2E Tests
```javascript
// cypress/integration/punchin-flow.spec.js
describe('Punch-In Flow', () => {
  beforeEach(() => {
    // Login and navigate to punch-in page
    cy.login();
    cy.visit('/punchin');
  });

  it('completes successful punch-in flow', () => {
    // Step 1: Select customer
    cy.get('[data-testid="customer-dropdown"]').click();
    cy.get('[data-testid="customer-search"]').type('Test Customer');
    cy.get('[data-testid="customer-option"]').first().click();
    cy.get('[data-testid="next-button"]').click();

    // Step 2: Capture photo
    cy.get('[data-testid="camera-button"]').click();
    cy.get('[data-testid="capture-button"]').click();
    cy.get('[data-testid="next-button"]').click();

    // Step 3: Capture location
    cy.get('[data-testid="location-button"]').click();
    cy.wait('@getCurrentPosition');
    cy.get('[data-testid="next-button"]').click();

    // Step 4: Confirm and submit
    cy.get('[data-testid="punch-in-button"]').click();
    
    // Verify success
    cy.contains('Punched in successfully!').should('be.visible');
  });

  it('handles location permission denial', () => {
    // Mock location permission denial
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success, error) => {
        error(new Error('User denied location access'));
      });
    });

    // Navigate through wizard to location step
    // Verify error handling
  });

  it('validates required fields', () => {
    // Try to proceed without selecting customer
    cy.get('[data-testid="next-button"]').should('be.disabled');
    
    // Select customer without location
    cy.get('[data-testid="customer-dropdown"]').click();
    cy.get('[data-testid="customer-no-location"]').click();
    cy.get('[data-testid="next-button"]').should('be.disabled');
    
    // Verify validation messages
    cy.contains('Please select a customer with location data').should('be.visible');
  });
});
```

## 🔧 Testing Setup

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|jpg|jpeg|png|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.stories.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Setup File
```javascript
// src/setupTests.js
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock console methods in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};
```

## 📊 Coverage Goals

### Coverage Targets
- **Overall Coverage**: 85%+
- **Component Coverage**: 90%+
- **Hook Coverage**: 95%+
- **Utility Functions**: 100%
- **Critical Paths**: 100%

### Coverage Exclusions
```javascript
// Files to exclude from coverage
- *.stories.js (Storybook files)
- *.config.js (Configuration files)
- index.js (Barrel exports)
- constants/*.js (Static constants)
```

## 🚀 Testing Commands

### NPM Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
```

## 📚 Testing Best Practices

### Do's
- ✅ Test user behavior and interactions
- ✅ Use descriptive test names
- ✅ Test error conditions and edge cases
- ✅ Mock external dependencies
- ✅ Use data-testid for stable selectors
- ✅ Test accessibility features
- ✅ Keep tests simple and focused
- ✅ Use arrange-act-assert pattern

### Don'ts
- ❌ Test implementation details
- ❌ Write overly complex tests
- ❌ Ignore async operations
- ❌ Test everything in one test
- ❌ Use brittle selectors (CSS classes)
- ❌ Mock too much (test closest to reality)
- ❌ Ignore error states
- ❌ Write tests without assertions

## 🔄 Testing Workflow

### Development Workflow
1. **Write Failing Test**: Start with a failing test (TDD)
2. **Write Minimal Code**: Make the test pass
3. **Refactor**: Improve code while keeping tests green
4. **Add Edge Cases**: Test error conditions and edge cases
5. **Update Documentation**: Update test documentation

### PR Workflow
1. **All Tests Pass**: No failing tests
2. **Coverage Maintained**: Coverage doesn't decrease
3. **New Features Tested**: New code has corresponding tests
4. **Integration Tests**: Major features have integration tests
5. **Manual Testing**: Critical paths manually verified

This comprehensive testing strategy ensures high code quality and maintainability while supporting the modular architecture established in the codebase.

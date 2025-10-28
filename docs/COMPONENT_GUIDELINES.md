# Component Development Guidelines

## Overview
This document provides guidelines for developing components following the modular architecture patterns established in the Punchin feature refactoring.

## 🏗️ Architecture Principles

### 1. Single Responsibility Principle
Each component should have one clear, focused responsibility:

```jsx
// ✅ Good - Focused responsibility
const CustomerSelectionStep = ({ customers, onSelect }) => {
  // Only handles customer selection logic
};

// ❌ Bad - Multiple responsibilities
const PunchinEverything = () => {
  // Handles customers, photos, location, confirmation...
};
```

### 2. Component Composition
Break down large components into smaller, composable pieces:

```jsx
// ✅ Good - Composed from smaller components
const WizardStep = () => (
  <div>
    <StepProgress />
    <StepContent />
    <StepActions />
  </div>
);

// ❌ Bad - All logic in one component
const MassiveComponent = () => {
  // 1000+ lines of mixed logic
};
```

## 📋 Component Structure Template

### Basic Component Template
```jsx
import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.scss';

const ComponentName = memo(({ 
  prop1, 
  prop2, 
  onAction 
}) => {
  // Memoized calculations
  const computedValue = useMemo(() => {
    return expensiveCalculation(prop1);
  }, [prop1]);

  // Event handlers
  const handleAction = useCallback((data) => {
    // Handle action
    onAction(data);
  }, [onAction]);

  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
});

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func.isRequired
};

ComponentName.displayName = 'ComponentName';

export default ComponentName;
```

### Wizard Step Component Template
```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const ANIMATION_VARIANTS = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const WizardStepName = ({ 
  data,
  onNext,
  onPrev,
  canProceed = false 
}) => {
  return (
    <motion.div
      variants={ANIMATION_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      className="wizard_step step-name"
    >
      <h2>Step Title</h2>
      
      {/* Step content */}
      
      <div className="wizard_actions">
        <button className="wizard_btn secondary" onClick={onPrev}>
          <IoChevronBack /> Previous
        </button>
        {canProceed && (
          <button className="wizard_btn primary" onClick={onNext}>
            Next <IoChevronForward />
          </button>
        )}
      </div>
    </motion.div>
  );
};

WizardStepName.propTypes = {
  data: PropTypes.object,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  canProceed: PropTypes.bool
};

export default WizardStepName;
```

## 🎣 Custom Hooks Guidelines

### Hook Structure Template
```jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../../../utils/logger';

const useFeatureName = (dependency1, dependency2) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cleanupRef = useRef();

  const performAction = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Perform action
      const result = await someAsyncOperation(dependency1);
      setState(result);
      logger.info('Action completed successfully');
    } catch (err) {
      setError(err.message);
      logger.error('Action failed:', err);
    } finally {
      setLoading(false);
    }
  }, [dependency1]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    state,
    loading,
    error,
    performAction
  };
};

export default useFeatureName;
```

## 📁 File Organization

### Feature Structure
```
features/
└── feature-name/
    ├── components/
    │   ├── FeatureMain.jsx
    │   └── sub-components/
    │       ├── ComponentA.jsx
    │       ├── ComponentB.jsx
    │       └── ComponentC.jsx
    ├── hooks/
    │   ├── useFeatureLogic.js
    │   └── useFeatureCache.js
    ├── constants/
    │   └── featureConstants.js
    ├── pages/
    │   └── FeaturePage.jsx
    ├── services/
    │   └── featureService.js
    ├── styles/
    │   ├── feature.scss
    │   └── components/
    └── index.js
```

## 🎯 Best Practices

### 1. Performance Optimization
```jsx
// Use React.memo for components
const Component = memo(({ props }) => { /* ... */ });

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 2. Error Handling
```jsx
const Component = () => {
  const [error, setError] = useState(null);

  const handleAsyncAction = async () => {
    try {
      setError(null);
      await performAction();
    } catch (err) {
      setError(err.message);
      logger.error('Component action failed:', err);
    }
  };

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleAsyncAction} />;
  }

  // Normal render
};
```

### 3. Accessibility
```jsx
<button
  onClick={handleClick}
  disabled={loading}
  aria-describedby={error ? "error-message" : undefined}
  aria-label="Clear and descriptive label"
>
  Action
</button>

{error && (
  <div id="error-message" role="alert">
    {error}
  </div>
)}
```

### 4. PropTypes Documentation
```jsx
Component.propTypes = {
  // Required props
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  
  // Optional props with defaults
  variant: PropTypes.oneOf(['primary', 'secondary']),
  disabled: PropTypes.bool,
  
  // Functions
  onClick: PropTypes.func.isRequired,
  onHover: PropTypes.func,
  
  // Complex objects
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number
  }),
  
  // Arrays
  items: PropTypes.arrayOf(PropTypes.string)
};

Component.defaultProps = {
  variant: 'primary',
  disabled: false
};
```

## 🧪 Testing Guidelines

### Component Testing Template
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    prop1: 'value1',
    onAction: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with default props', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<ComponentName {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /action/i });
    await user.click(button);
    
    expect(defaultProps.onAction).toHaveBeenCalledWith(expectedData);
  });

  test('handles error states', async () => {
    const onAction = jest.fn().mockRejectedValue(new Error('Test error'));
    render(<ComponentName {...defaultProps} onAction={onAction} />);
    
    // Trigger error
    await user.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Hook Testing Template
```jsx
import { renderHook, act } from '@testing-library/react';
import useFeatureName from './useFeatureName';

describe('useFeatureName', () => {
  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useFeatureName());
    
    expect(result.current.state).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('handles async operations', async () => {
    const { result } = renderHook(() => useFeatureName());
    
    act(() => {
      result.current.performAction();
    });
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.state).toBeDefined();
    });
  });
});
```

## 📚 Documentation Requirements

### Component Documentation
Each component should have:
1. **Purpose**: What does this component do?
2. **Props**: All props with types and descriptions
3. **Usage Examples**: Common use cases
4. **Accessibility**: ARIA labels and keyboard support
5. **Testing**: How to test this component

### Hook Documentation
Each hook should have:
1. **Purpose**: What business logic does it encapsulate?
2. **Parameters**: Input parameters and their types
3. **Return Value**: What the hook returns
4. **Side Effects**: What side effects it may have
5. **Usage Examples**: How to use in components

## 🔄 Migration Strategy

### From Monolithic to Modular
1. **Identify Responsibilities**: List all the things the large component does
2. **Create Focused Components**: One component per responsibility
3. **Extract Business Logic**: Move logic to custom hooks
4. **Centralize Configuration**: Move constants to dedicated files
5. **Test Each Component**: Ensure functionality is preserved
6. **Update Documentation**: Document the new structure

### Example Refactoring Checklist
- [ ] Component has single responsibility
- [ ] Business logic extracted to hooks
- [ ] PropTypes defined with proper validation
- [ ] Performance optimized with memo/useCallback/useMemo
- [ ] Error handling implemented
- [ ] Accessibility features added
- [ ] Tests written
- [ ] Documentation updated

This template ensures consistency across all components and maintains the high quality established in the Punchin feature refactoring.

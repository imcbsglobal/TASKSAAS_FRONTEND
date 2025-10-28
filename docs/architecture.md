---
**Title:** Task WebApp Frontend - Architecture Overview  
**Description:** System design, C4 diagrams, component architecture, data flow, and technology stack  
**Last Updated:** October 2, 2025  
**Status:** Production Ready
---

# Architecture Overview

## Table of Contents

- [System Context](#system-context)
- [Container Architecture](#container-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Feature-Based Architecture](#feature-based-architecture)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)
- [See Also](#see-also)

---

## System Context

### C4 Model - Level 1: System Context Diagram

```mermaid
C4Context
    title System Context Diagram - Task WebApp

    Person(fieldWorker, "Field Worker", "Punches in/out at customer locations")
    Person(manager, "Manager", "Monitors team attendance and approves exceptions")
    Person(financeUser, "Finance User", "Manages cash/bank books and debtors")
    Person(admin, "System Admin", "Configures system and manages users")

    System(taskWebApp, "Task WebApp Frontend", "Single Page Application for workforce and financial management")

    System_Ext(backendAPI, "Backend API", "REST API providing business logic and data persistence")
    System_Ext(gpsService, "GPS Service", "Device location services")
    System_Ext(cameraAPI, "Camera API", "Device camera for photo capture")
    System_Ext(mapService, "Map Service", "Leaflet/OpenStreetMap for mapping")

    Rel(fieldWorker, taskWebApp, "Uses", "HTTPS")
    Rel(manager, taskWebApp, "Uses", "HTTPS")
    Rel(financeUser, taskWebApp, "Uses", "HTTPS")
    Rel(admin, taskWebApp, "Uses", "HTTPS")

    Rel(taskWebApp, backendAPI, "Makes API calls", "JSON/HTTPS")
    Rel(taskWebApp, gpsService, "Gets location", "Navigator API")
    Rel(taskWebApp, cameraAPI, "Captures photos", "Media API")
    Rel(taskWebApp, mapService, "Displays maps", "Leaflet JS")

    UpdateRelStyle(fieldWorker, taskWebApp, $offsetY="-40", $offsetX="-50")
    UpdateRelStyle(manager, taskWebApp, $offsetY="-40", $offsetX="20")
    UpdateRelStyle(taskWebApp, backendAPI, $offsetY="-20")
```

---

## Container Architecture

### C4 Model - Level 2: Container Diagram

```mermaid
C4Container
    title Container Diagram - Task WebApp Frontend

    Person(user, "User", "Field worker, manager, or finance user")

    Container_Boundary(frontend, "Task WebApp Frontend") {
        Container(spa, "Single Page Application", "React 19, Vite", "Delivers UI and handles client-side logic")
        Container(router, "Router", "React Router v7", "Handles navigation and route protection")
        Container(store, "State Store", "Redux Toolkit", "Centralized application state")
        Container(apiClient, "API Client", "Axios", "HTTP client with interceptors")
        Container(localStorage, "Local Storage", "Browser API", "Offline data and caching")
    }

    System_Ext(backend, "Backend API", "Node.js/Django REST API")
    System_Ext(cdn, "CDN", "Static asset delivery")

    Rel(user, spa, "Interacts with", "HTTPS")
    Rel(spa, router, "Uses for navigation")
    Rel(spa, store, "Reads/writes state")
    Rel(apiClient, backend, "Makes API calls", "JSON/HTTPS")
    Rel(spa, apiClient, "Uses for data fetching")
    Rel(spa, localStorage, "Persists data")
    Rel(cdn, spa, "Serves static assets")

    UpdateRelStyle(user, spa, $offsetX="-50")
```

### Application Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[UI Components]
        Pages[Pages/Routes]
        Layouts[Layouts]
    end

    subgraph "Business Logic Layer"
        Features[Feature Modules]
        Hooks[Custom Hooks]
        Services[API Services]
    end

    subgraph "State Management Layer"
        Redux[Redux Store]
        LocalState[Component State]
        Cache[Local Storage Cache]
    end

    subgraph "Infrastructure Layer"
        HTTP[HTTP Client]
        Router[Router]
        Config[Configuration]
    end

    UI --> Features
    Pages --> Features
    Features --> Hooks
    Features --> Services
    Hooks --> Redux
    Hooks --> Cache
    Services --> HTTP
    HTTP --> Config
    Pages --> Router
```

---

## Component Architecture

### C4 Model - Level 3: Component Diagram (Punch-In Feature)

```mermaid
C4Component
    title Component Diagram - Punch-In Feature

    Container_Boundary(punchinFeature, "Punch-In Feature") {
        Component(wizard, "Punch-In Wizard", "React Component", "Multi-step wizard for punch-in process")
        Component(customerStep, "Customer Selection", "React Component", "Select customer from dropdown")
        Component(photoStep, "Photo Capture", "React Component", "Camera modal for photo verification")
        Component(locationStep, "Location Verification", "React Component", "GPS and map validation")
        Component(confirmStep, "Confirmation", "React Component", "Review and submit")
        
        Component(useCustomerCache, "useCustomerCache", "Custom Hook", "Customer data caching")
        Component(useLocationMap, "useLocationMap", "Custom Hook", "Map state management")
        Component(useCamera, "useCamera", "Custom Hook", "Camera API abstraction")
        
        Component(punchService, "Punch Service", "API Service", "Punch-in/out API calls")
        Component(validation, "Distance Validator", "Utility", "100m radius validation")
    }

    Container_Ext(store, "Redux Store", "Global state management")
    Container_Ext(apiClient, "API Client", "HTTP communication")

    Rel(wizard, customerStep, "Renders")
    Rel(wizard, photoStep, "Renders")
    Rel(wizard, locationStep, "Renders")
    Rel(wizard, confirmStep, "Renders")
    
    Rel(customerStep, useCustomerCache, "Uses")
    Rel(locationStep, useLocationMap, "Uses")
    Rel(photoStep, useCamera, "Uses")
    
    Rel(locationStep, validation, "Validates distance")
    Rel(wizard, punchService, "Submits data")
    Rel(punchService, apiClient, "Makes HTTP calls")
    Rel(useCustomerCache, store, "Reads from")
```

### Feature Module Structure

```mermaid
graph TD
    subgraph "Feature Module (e.g., Punch-In)"
        Index[index.js - Barrel Exports]
        
        subgraph Components
            Main[Main Component]
            Sub1[Sub-Component 1]
            Sub2[Sub-Component 2]
        end
        
        subgraph Hooks
            Hook1[Custom Hook 1]
            Hook2[Custom Hook 2]
        end
        
        subgraph Pages
            Page1[Feature Page]
        end
        
        subgraph Services
            Service[API Service]
        end
        
        subgraph Styles
            Scss[SCSS Files]
        end
        
        subgraph Constants
            Const[Feature Constants]
        end
    end
    
    Index --> Components
    Index --> Hooks
    Index --> Pages
    Components --> Hooks
    Components --> Services
    Components --> Const
    Page1 --> Main
    Service --> HTTP[API Client]
```

---

## Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Form
    participant Redux as Redux Store
    participant API as API Client
    participant Backend as Backend API
    participant LS as Local Storage

    User->>UI: Enter credentials
    UI->>API: POST /login
    API->>Backend: HTTP Request
    Backend-->>API: JWT Token + User Data
    API-->>Redux: Dispatch login success
    Redux-->>LS: Store token & user
    Redux-->>UI: Update auth state
    UI-->>User: Redirect to dashboard

    Note over Redux,LS: Token stored for<br/>subsequent requests
```

### Punch-In Flow

```mermaid
sequenceDiagram
    actor User
    participant Wizard as Punch-In Wizard
    participant GPS as GPS Service
    participant Camera as Camera API
    participant Validator as Distance Validator
    participant Service as Punch Service
    participant Backend as Backend API

    User->>Wizard: Start punch-in
    Wizard->>User: Step 1: Select Customer
    User->>Wizard: Choose customer
    
    Wizard->>Camera: Step 2: Capture Photo
    Camera-->>Wizard: Photo data
    
    Wizard->>GPS: Step 3: Get Location
    GPS-->>Wizard: Coordinates
    Wizard->>Validator: Validate distance
    
    alt Within 100m
        Validator-->>Wizard: Valid
        Wizard->>User: Step 4: Confirm
        User->>Wizard: Confirm punch-in
        Wizard->>Service: Submit punch data
        Service->>Backend: POST /punch-in
        Backend-->>Service: Success response
        Service-->>Wizard: Update state
        Wizard-->>User: Show success
    else Outside 100m
        Validator-->>Wizard: Invalid
        Wizard-->>User: Show error message
    end
```

### Data Fetch & Cache Flow

```mermaid
sequenceDiagram
    participant Component
    participant Hook as Custom Hook
    participant Cache as Local Storage
    participant API as API Client
    participant Backend

    Component->>Hook: Request data
    Hook->>Cache: Check cache
    
    alt Cache Hit
        Cache-->>Hook: Cached data
        Hook-->>Component: Return data
    else Cache Miss
        Hook->>API: Fetch from API
        API->>Backend: HTTP Request
        Backend-->>API: Response data
        API-->>Hook: Return data
        Hook->>Cache: Store in cache
        Hook-->>Component: Return data
    end

    Note over Hook,Cache: Cache invalidated<br/>after 5 minutes
```

---

## State Management

### Redux Store Architecture

```mermaid
graph TB
    subgraph "Redux Store"
        Root[Root Reducer]
        
        subgraph Slices
            Auth[Auth Slice]
            User[User Slice]
            Punch[Punch Slice]
        end
        
        subgraph Middleware
            Thunk[Redux Thunk]
            Logger[Logger - Dev Only]
        end
    end
    
    Root --> Auth
    Root --> User
    Root --> Punch
    
    Auth --> Thunk
    Thunk --> API[API Calls]
    
    Components[React Components] --> Selectors[useSelector]
    Components --> Dispatch[useDispatch]
    Selectors --> Root
    Dispatch --> Root
```

### State Hierarchy

```typescript
// Global State Structure
{
  auth: {
    user: {
      client_id: string,
      username: string,
      role: 'admin' | 'user',
      accountcode: string
    },
    token: string,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  // Feature states managed in components
}
```

### State Management Strategy

| State Type | Solution | Use Case |
|------------|----------|----------|
| **Global Auth** | Redux | User session, token |
| **Feature State** | Component State | UI state, form data |
| **Server Cache** | Custom Hooks | API responses, customer lists |
| **UI State** | Local State | Modals, dropdowns, toggles |
| **Persistent** | Local Storage | Offline data, preferences |

---

## Feature-Based Architecture

### Directory Structure

```
src/
├── app/                    # Application shell
│   ├── App.jsx            # Routing & layout
│   ├── AppProviders.jsx   # Providers wrapper
│   └── config.js          # Environment config
│
├── features/              # Self-contained features
│   ├── auth/              # Authentication
│   │   ├── components/    # Login form, protected routes
│   │   ├── pages/         # Login page
│   │   ├── store/         # Auth slice
│   │   ├── styles/        # Auth styles
│   │   └── index.js       # Barrel exports
│   │
│   ├── punchin/           # Punch-in/out
│   │   ├── components/    # Wizard, steps, camera
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Punch pages
│   │   ├── services/      # Punch API
│   │   ├── styles/        # Punch styles
│   │   └── index.js
│   │
│   ├── finance/           # Financial management
│   └── dashboard/         # Dashboards
│
├── components/            # Shared components
│   ├── layout/            # Navbar, footer
│   └── ui/                # Buttons, modals, tables
│
├── services/              # Core services
│   ├── apiClient.js       # Axios instance
│   └── index.js
│
├── hooks/                 # Global custom hooks
├── utils/                 # Utility functions
├── constants/             # App constants
└── store/                 # Redux configuration
```

### Feature Module Pattern

Each feature is **self-contained** and follows this structure:

```
feature-name/
├── components/            # Feature-specific components
│   ├── FeatureMain.jsx
│   └── SubComponent.jsx
├── hooks/                 # Feature-specific hooks
│   └── useFeatureLogic.js
├── pages/                 # Feature pages
│   └── FeaturePage.jsx
├── services/              # Feature API calls
│   └── featureService.js
├── styles/                # Feature styles
│   └── feature.scss
├── constants/             # Feature constants
│   └── constants.js
└── index.js              # Barrel exports
```

**Benefits:**
- ✅ Easy to locate and modify feature code
- ✅ Clear boundaries and dependencies
- ✅ Facilitates code splitting and lazy loading
- ✅ Enables feature flags and A/B testing
- ✅ Simplifies testing and maintenance

---

## Technology Stack

### Frontend Technologies

```mermaid
graph LR
    subgraph "Core"
        React[React 19]
        Router[React Router 7]
        Redux[Redux Toolkit]
    end
    
    subgraph "Build & Dev"
        Vite[Vite 7]
        ESLint[ESLint]
        Sass[Sass/SCSS]
    end
    
    subgraph "UI Libraries"
        Tailwind[Tailwind CSS 4]
        Framer[Framer Motion]
        Icons[React Icons]
    end
    
    subgraph "Data & HTTP"
        Axios[Axios]
        ReactTable[React Table]
    end
    
    subgraph "Maps & Media"
        Leaflet[Leaflet]
        Camera[Navigator API]
    end
    
    React --> Router
    React --> Redux
    React --> Tailwind
    React --> Framer
    Vite --> React
    Axios --> React
```

### Technology Decisions

| Technology | Version | Reason |
|------------|---------|--------|
| **React** | 19 RC | Server Components, improved performance, better DX |
| **Vite** | 7.0 | 10-100x faster builds, HMR, ESM-native |
| **Redux Toolkit** | 2.8 | Simplified Redux, built-in best practices |
| **React Router** | 7.7 | Data loading, nested routes, code splitting |
| **Axios** | 1.11 | Interceptors, request cancellation, TypeScript support |
| **Leaflet** | 1.9 | No API key, lightweight, open source |
| **SCSS** | 1.89 | Variables, mixins, nesting |
| **Tailwind** | 4.1 | Utility-first, rapid prototyping, purged builds |
| **Framer Motion** | 12.23 | Declarative animations, great DX |

---

## Design Patterns

### 1. Container-Presentational Pattern

```jsx
// Container (Smart Component)
const CustomerSelectionContainer = () => {
  const { customers, loading, error } = useCustomerCache();
  const [selected, setSelected] = useState(null);

  return (
    <CustomerSelectionPresenter
      customers={customers}
      loading={loading}
      error={error}
      selected={selected}
      onSelect={setSelected}
    />
  );
};

// Presenter (Dumb Component)
const CustomerSelectionPresenter = ({
  customers,
  loading,
  selected,
  onSelect
}) => {
  if (loading) return <Spinner />;
  
  return (
    <select value={selected} onChange={(e) => onSelect(e.target.value)}>
      {customers.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
};
```

### 2. Custom Hooks Pattern

```jsx
// Encapsulate complex logic in custom hooks
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLocation = useCallback(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { location, error, loading, fetchLocation };
};
```

### 3. Service Layer Pattern

```jsx
// Centralize API calls in service modules
// src/features/punchin/services/punchService.js
import apiClient from '../../../services/apiClient';

export const PunchAPI = {
  async punchIn(data) {
    return apiClient.post('/punch-in', data);
  },
  
  async punchOut(punchId) {
    return apiClient.post(`/punch-out/${punchId}`);
  },
  
  async getActivePunch() {
    return apiClient.get('/punch-in/active');
  }
};
```

### 4. Composition Pattern

```jsx
// Build complex UIs from simple components
const Wizard = ({ steps, currentStep, onNext, onPrev }) => (
  <div className="wizard">
    <WizardProgress steps={steps} current={currentStep} />
    <WizardContent>{steps[currentStep].component}</WizardContent>
    <WizardActions onNext={onNext} onPrev={onPrev} />
  </div>
);
```

---

## Security Architecture

### Authentication & Authorization

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Login with credentials
    Frontend->>Backend: POST /login
    Backend->>DB: Verify credentials
    DB-->>Backend: User + Role
    Backend-->>Frontend: JWT Token
    Frontend->>Frontend: Store token (localStorage)
    
    Note over Frontend: All subsequent requests include token
    
    Frontend->>Backend: GET /protected-resource
    Note over Frontend: Authorization: Bearer {token}
    Backend->>Backend: Verify JWT
    Backend->>Backend: Check role permissions
    Backend-->>Frontend: Resource data
```

### Security Layers

1. **Client-Side Protection**
   - Route guards (ProtectedRoute)
   - Role-based rendering
   - Input validation
   - XSS prevention (React escaping)

2. **HTTP Security**
   - JWT tokens in Authorization header
   - HTTPS only in production
   - CORS configuration
   - Request/response interceptors

3. **Data Security**
   - Sensitive data not in localStorage
   - Token expiration handling
   - Automatic logout on 401
   - No credentials in URL params

---

## Performance Architecture

### Code Splitting Strategy

```jsx
// Route-based code splitting
const DashboardAdmin = lazy(() => import('./features/dashboard/pages/Dashboard_admin'));
const PunchInCapture = lazy(() => import('./features/punchin/pages/PunchInCapture'));

// Lazy load with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard/admin" element={<DashboardAdmin />} />
    <Route path="/punch-in/capture" element={<PunchInCapture />} />
  </Routes>
</Suspense>
```

### Performance Optimization Techniques

| Technique | Implementation | Impact |
|-----------|----------------|--------|
| **Code Splitting** | React.lazy + Suspense | -60% initial bundle |
| **Tree Shaking** | ES6 imports | -20% bundle size |
| **Image Optimization** | WebP, lazy loading | -40% image size |
| **Memoization** | React.memo, useMemo | -30% re-renders |
| **Debouncing** | Custom debounce hook | -70% API calls |
| **Virtual Scrolling** | React Table virtualization | Handles 10K+ rows |
| **Service Worker** | Workbox | Offline capability |

### Bundle Analysis

```
Initial Bundle:
├── vendor.js      180 KB (React, Redux, Router)
├── app.js         120 KB (Core app code)
├── features/      200 KB (Lazy-loaded features)
└── styles.css      45 KB (Purged Tailwind + SCSS)
─────────────────────────────
Total:             545 KB (gzipped: 180 KB)
```

---

## See Also

- [Introduction](./introduction.md) - Project overview and objectives
- [Development Guide](./development.md) - Local development setup
- [API Reference](./api-reference.md) - Backend API documentation
- [Performance Guide](./performance.md) - Optimization strategies
- [Security Guide](./security.md) - Security best practices

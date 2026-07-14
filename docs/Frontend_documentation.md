# MyStudyApp Frontend Documentation

## Table of Contents
1. [Introduction](#1-introduction)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Architectural Patterns & Design Principles](#4-architectural-patterns--design-principles)
5. [State Management Strategy](#5-state-management-strategy)
6. [API Layer & Data Fetching](#6-api-layer--data-fetching)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Routing & Navigation](#8-routing--navigation)
9. [UI Component Architecture](#9-ui-component-architecture)
10. [Design System & Theming](#10-design-system--theming)
11. [Real-Time Features with SSE](#11-real-time-features-with-sse)
12. [Performance Optimizations](#12-performance-optimizations)
13. [Mobile Responsiveness](#13-mobile-responsiveness)
14. [Error Handling & Resilience](#14-error-handling--resilience)
15. [Development Tooling & Build](#15-development-tooling--build)
16. [Security Considerations](#16-security-considerations)
17. [Future Roadmap & Improvements](#17-future-roadmap--improvements)
18. [Conclusion](#18-conclusion)

---

## 1. Introduction

MyStudyApp is a modern, feature-rich web application designed for university campus event management. The frontend serves as the primary interface for students, event hosts, and administrators to discover, create, manage, and attend events. Built with React 18, TypeScript, and a robust ecosystem of libraries, the application emphasizes real-time interactivity, responsive design, and a seamless user experience.

This document provides an in-depth technical analysis of the frontend codebase, covering architecture, design patterns, state management, API integration, security, performance, and future-ready practices.

---

## 2. Technology Stack

| Category          | Technology                     | Version   | Purpose |
|-------------------|--------------------------------|-----------|---------|
| **UI Framework**  | React                          | 18.3.1    | Component-based UI |
| **Language**      | TypeScript                     | 5.6.2     | Static typing, better maintainability |
| **Build Tool**    | Vite                           | 5.4.8     | Fast development server and builds |
| **UI Library**    | Mantine Core                   | 7.13.2    | Comprehensive, accessible components |
| **Date/Time**     | Mantine Dates                  | 7.13.2    | Date pickers, formatting |
| **Notifications** | Mantine Notifications          | 7.13.2    | Toast notifications |
| **Styling**       | Tailwind CSS                   | 3.4.14    | Utility-first CSS for rapid styling |
| **Animations**    | Framer Motion                  | 11.11.11  | Declarative animations and transitions |
| **State (Client)**| Zustand                        | 4.5.5     | Lightweight, persistent client state |
| **State (Server)**| TanStack React Query           | 5.59.15   | Caching, synchronization, infinite queries |
| **Routing**       | React Router DOM               | 6.26.2    | Client-side routing with nested routes |
| **HTTP Client**   | Axios                          | 1.7.7     | Interceptors, request/response handling |
| **QR Scanning**   | @zxing/browser                 | 0.0.12    | Camera-based QR code decoding |
| **QR Generation** | qrcode.react                   | 3.1.0     | QR code rendering |
| **Form Handling** | Mantine Form                   | (built-in)| Validation, state management |
| **Utilities**     | clsx, tailwind-merge           | -         | Conditional class composition |

---

## 3. Project Structure

The project follows a feature-based and component-based organization, with clear separation of concerns.

```
frontend/
├── public/                      # Static assets (favicon, manifest, service worker)
├── src/
│   ├── api/                     # API service layer (domain-specific modules)
│   │   ├── client.ts            # Axios instance with interceptors
│   │   ├── authApi.ts           # Authentication endpoints
│   │   ├── eventsApi.ts         # Event CRUD and feed
│   │   ├── adminApi.ts          # Admin operations
│   │   ├── rsvpApi.ts           # Registration (RSVP) endpoints
│   │   ├── reviewsApi.ts        # Review system
│   │   ├── reportsApi.ts        # Reporting system
│   │   ├── notificationsApi.ts  # Notifications
│   │   └── searchApi.ts         # Search suggestions
│   │
│   ├── components/              # Reusable UI components (Atomic Design)
│   │   ├── atoms/               # Smallest building blocks
│   │   ├── molecules/           # Combinations of atoms
│   │   ├── organisms/           # Complex sections
│   │   ├── templates/           # Page layouts and route guards
│   │   └── ui/                  # Base UI components (Button, Card, etc.)
│   │
│   ├── pages/                   # Page-level components (route endpoints)
│   │   ├── Admin/               # Admin dashboard pages
│   │   ├── Auth/                # Authentication pages
│   │   ├── CheckIn/             # QR check-in pages (host/attendee)
│   │   ├── Error/               # Error pages (404, error boundary)
│   │   ├── Events/              # Event listing, detail, creation, editing
│   │   ├── Home/                # Landing page
│   │   ├── Profile/             # User profile and settings
│   │   └── Registrations/       # My registrations list
│   │
│   ├── hooks/                   # Custom React hooks (domain-specific)
│   │   ├── useAuth.ts           # Authentication logic
│   │   ├── useEvents.ts         # Event queries (infinite scroll)
│   │   ├── useRsvp.ts           # RSVP mutations and queries
│   │   ├── useReviews.ts        # Review operations
│   │   ├── useAdmin.ts          # Admin dashboard and management
│   │   ├── useNotifications.ts  # Notification polling
│   │   ├── useSearch.ts         # Search with debounce
│   │   ├── useEventSse.ts       # Server-Sent Events for real-time updates
│   │   └── ...                  # Others (useCategories, useDebounce, etc.)
│   │
│   ├── stores/                  # Zustand stores (client state)
│   │   └── authStore.ts         # Authentication state (persisted)
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # All DTOs, responses, enums
│   │
│   ├── constants/               # Application constants
│   │   ├── routes.ts            # Route definitions
│   │   ├── enums.ts             # Shared enums (EventStatus, RsvpStatus, etc.)
│   │   ├── queryKeys.ts         # React Query key constants
│   │   └── validation.ts        # Validation regex and constraints
│   │
│   ├── design-system/           # Design tokens and theme
│   │   ├── tokens.ts            # Colors, typography, spacing, shadows
│   │   ├── mantineTheme.ts      # Mantine theme configuration
│   │   ├── global.css           # Global CSS variables and base styles
│   │   ├── mantineTheme.css     # Tailwind integration with Mantine
│   │   └── animations.ts        # Framer Motion variants
│   │
│   ├── utils/                   # Utility functions
│   │   ├── cn.ts                # Class name composition (clsx + twMerge)
│   │   ├── dateFormatter.ts     # Date formatting
│   │   └── fileHelpers.ts       # File type validation, size formatting
│   │
│   ├── lib/                     # Third-party configuration
│   │   └── queryClient.ts       # React Query client setup
│   │
│   ├── App.tsx                  # Root component with routing
│   ├── main.tsx                 # Entry point (ReactDOM.createRoot)
│   ├── index.css                # Import of global CSS and Mantine styles
│   └── vite-env.d.ts            # Vite environment types
│
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS (Tailwind, autoprefixer)
├── tsconfig.json                # TypeScript configuration
└── eslint.config.js             # ESLint configuration
```

---

## 4. Architectural Patterns & Design Principles

### 4.1 Atomic Design

The component hierarchy follows the **Atomic Design** methodology, promoting reusability and consistency:

- **Atoms** – Basic HTML elements with styling (e.g., `Button`, `Input`, `Badge`).  
- **Molecules** – Groups of atoms working together (e.g., `EventCard`, `SearchBar`, `CapacityBar`).  
- **Organisms** – Complex UI sections composed of molecules and atoms (e.g., `EventFeed`, `Navbar`, `ReviewSection`).  
- **Templates** – Page-level layouts that position organisms (e.g., `PageLayout`, `AdminLayout`).  
- **Pages** – Full views that combine templates and organisms with data.

**Benefits:**
- Clear separation of concerns.
- High reusability and testability.
- Consistent design language across the application.

### 4.2 Repository Pattern (API Layer)

Each domain (auth, events, admin, etc.) has a dedicated API module that encapsulates all HTTP calls. These modules return typed responses, centralizing endpoint definitions and making them easy to mock in tests.

### 4.3 Observer Pattern (Real-Time Updates)

The application uses **Server-Sent Events (SSE)** to push real-time updates to the client. The `useEventSse` hook subscribes to an event stream and reacts to incoming messages (RSVP updates, waitlist promotions, event cancellations) by invalidating relevant React Query caches and showing notifications.

### 4.4 Factory Pattern (Event Creation)

The event creation flow uses a `EventFactory` on the backend, while the frontend uses a unified `EventForm` component that adapts to both create and edit modes, leveraging the same form schema and validation.

### 4.5 Strategy Pattern (Button Logic in EventCard)

The `EventCard` component uses conditional logic to determine the button label, variant, and action based on the user's authentication state, RSVP status, event timing, and host status. This is a form of the Strategy pattern, where the UI behavior changes based on context.

### 4.6 Dependency Inversion (Custom Hooks)

The frontend abstracts business logic into custom hooks (`useAuth`, `useEvents`, `useRsvp`, etc.). Pages and components depend on these hooks rather than directly calling API functions, promoting loose coupling and easier testing.

---

## 5. State Management Strategy

MyStudyApp employs a **hybrid state management** approach:

### 5.1 Client State – Zustand

**Zustand** is used for global client state that needs to persist across sessions, primarily authentication.

```ts
// stores/authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  setTokens: (access: string, refresh: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({ ... }),
    { name: 'auth-storage' } // LocalStorage persistence
  )
);
```

**Why Zustand?**
- Lightweight, minimal boilerplate.
- Built-in persistence via middleware.
- No need for context providers.

### 5.2 Server State – TanStack React Query

**React Query** handles all server state: caching, background refetching, pagination, and mutations.

**Key Features Used:**
- **Infinite Queries** for paginated event feeds (`useEvents`).
- **Mutations** with optimistic updates (`useRsvp`).
- **Cache Invalidation** after mutations to keep UI fresh.
- **Stale-While-Revalidate** strategy with configurable `staleTime`.

**Query Client Configuration:**
```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 30,     // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 5.3 UI State – Local Component State

- `useState` for ephemeral UI state (modal open, form inputs, tab selection).
- `useForm` (Mantine) for complex form validation and submission.

### 5.4 URL State – React Router

- Search parameters (`useSearchParams`) drive filtering on the Events page.
- Path parameters (`useParams`) for event slugs, user IDs.

---

## 6. API Layer & Data Fetching

### 6.1 Axios Client with Interceptors

The `client.ts` file configures an Axios instance with automatic JWT injection and token refresh logic.

```ts
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken, setTokens } = useAuthStore.getState();
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, null, {
          headers: { 'X-Refresh-Token': refreshToken },
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(accessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

**Key Design Points:**
- **Silent Refresh**: On 401/403, the interceptor automatically attempts to refresh the token using the refresh token (sent via header `X-Refresh-Token`).  
- **Retry Flag**: Prevents infinite loops in case of refresh failure.  
- **Logout on Failure**: If refresh fails, the user is logged out and redirected to login.

### 6.2 Domain-Specific API Modules

Each module exports typed functions that return `Promise<ApiResponse<T>>`. For example:

```ts
// api/eventsApi.ts
export const eventsApi = {
  getEvents: (params) => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    const endpoint = isAuth ? '/api/events' : '/api/public/events';
    return api.get<ApiResponse<PageResponse<Event>>>(endpoint, { params });
  },
  // ...
};
```

This pattern allows the API layer to be aware of authentication state, choosing public or authenticated endpoints accordingly.

### 6.3 React Query Hooks

Custom hooks encapsulate data fetching and caching logic:

```ts
// hooks/useEvents.ts
export function useEvents(filters: EventsFilters = {}) {
  const { isAuthenticated } = useAuthStore();
  return useInfiniteQuery({
    queryKey: [queryKeys.events, filters, isAuthenticated],
    queryFn: ({ pageParam = 0 }) => eventsApi.getEvents({ ...filters, page: pageParam, size: PAGE_SIZE }),
    getNextPageParam: (lastPage) => lastPage?.last ? undefined : lastPage.page + 1,
    initialPageParam: 0,
    staleTime: 1000 * 60,
  });
}
```

---

## 7. Authentication & Authorization

### 7.1 Authentication Flow

1. User submits login credentials via `LoginPage`.
2. `useAuth` calls `authApi.login()`.
3. On success, `setAuth()` updates the Zustand store with user, tokens, and `isAuthenticated = true`.
4. Tokens are persisted to localStorage.
5. User is redirected based on role (Admin → `/admin`, Student → `/`).

### 7.2 Route Protection

Two guard components are implemented:

- `ProtectedRoute`: Ensures user is authenticated; otherwise redirects to login.
- `AdminRoute`: Ensures user is authenticated **and** has role `ADMIN`; otherwise redirects home.

These are used in `App.tsx` to wrap protected routes:

```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<PageLayout />}>
    <Route path={ROUTES.CREATE_EVENT} element={<CreateEventPage />} />
    {/* ... */}
  </Route>
</Route>

<Route element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
    <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
    {/* ... */}
  </Route>
</Route>
```

### 7.3 AuthInitializer

The `AuthInitializer` component runs on app startup to restore the session from persisted storage. It also sets up a silent refresh interval (every 14 minutes) to preemptively refresh the access token before it expires.

```ts
useEffect(() => {
  if (isAuthenticated) {
    const refreshBuffer = 14 * 60 * 1000;
    silentRefreshTimer = setInterval(performSilentRefresh, refreshBuffer);
  }
  setLoading(false);
}, [isAuthenticated]);
```

This ensures that the user remains logged in across page reloads without unnecessary API calls.

---

## 8. Routing & Navigation

### 8.1 Route Definitions

All route paths are centralized in `constants/routes.ts` for maintainability:

```ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  EVENTS: '/events',
  EVENT_DETAIL: (slug: string) => `/events/${slug}`,
  CREATE_EVENT: '/events/create',
  // ...
} as const;
```

### 8.2 Nested Routes with Layouts

`App.tsx` uses nested `Route` components with layouts:

- **AuthLayout**: Wraps login, register, forgot password, etc. – full-page forms.
- **PageLayout**: Main layout with Navbar, Footer, and MobileBottomNav.
- **AdminLayout**: Separate layout with sidebar navigation for admin.

### 8.3 Dynamic Segments

- `/events/:slug` – Event detail page.
- `/profile/:userId` – Public profile.
- `/admin/events/detail/:slug` – Admin view of event details.

### 8.4 Location-Based State

The `EventsPage` uses `useSearchParams` to sync filter state (category, date range, location, query, sort) with the URL, enabling shareable and bookmarkable filtered views.

---

## 9. UI Component Architecture

### 9.1 Atomic Design in Practice

**Atoms:**
- `Button` – Wrapper around Mantine Button with variant mapping.
- `Card` – Generic card with hover, elevation variants.
- `EmptyState` – Reusable empty state with icon, title, and action.
- `ProgressiveImage` – Lazy-loaded image with skeleton.
- `SkeletonCard` – Placeholder card for loading states.

**Molecules:**
- `EventCard` – Full-featured event preview with dynamic RSVP button.
- `CapacityBar` – Visual progress bar for capacity.
- `CategoryChip` – Clickable category badge.
- `SearchBar` – Autocomplete with debounced search.
- `UserTrustBadge` – Trust level indicator with tooltip.
- `CheckInCodeDisplay` – QR code generation and refresh.

**Organisms:**
- `EventFeed` – Infinite scroll feed using `useInView`.
- `EventForm` – Complex form for creating/editing events with media upload.
- `Navbar` – Main navigation with user menu, dark mode toggle, notifications.
- `ReviewSection` – Review list, creation, helpful votes, reporting.
- `RsvpList` – Host view of attendees with status management.
- `HeroSection` – Landing page hero with search bar.

**Templates:**
- `PageLayout` – Main app shell with Navbar, Footer, and mobile bottom nav.
- `AuthLayout` – Two-column layout (form + showcase).
- `AdminLayout` – Sidebar navigation + main content area.
- `ProtectedRoute` / `AdminRoute` – Route guard wrappers.

**Pages:**
- Each page uses templates and organisms to compose the full view.

### 9.2 Reusable UI Components (`ui/`)

- `Button` – Extends Mantine Button with custom variants (`primary`, `secondary`, `danger`, etc.) and integrates with Tailwind.
- `Card` – Wrapper around Mantine Paper with consistent styling and hover effects.
- `ConfirmModal` – Standard confirmation dialog with loading state.
- `Skeleton` – Page and table skeleton loaders.

### 9.3 Component Communication

- **Props Drilling** is minimized by using hooks for data and Zustand for auth.
- **Callbacks** are passed to child components for actions (e.g., `onRsvp`, `onCancel`).
- **Context** is not used; global state is handled via hooks/stores.

---

## 10. Design System & Theming

### 10.1 Design Tokens (`tokens.ts`)

The design system defines tokens for colors, typography, spacing, shadows, and breakpoints. These tokens are used to generate both Mantine theme and CSS variables.

### 10.2 Mantine Theme (`mantineTheme.ts`)

The Mantine theme is extended with a custom brand color palette (violet shades) and component-specific default props and styles.

```ts
export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [ /* 10 shades from tokens */ ],
  },
  fontFamily: typography.fontFamily,
  headings: { fontFamily: typography.fontFamily, fontWeight: '700' },
  components: {
    Button: {
      defaultProps: { size: 'md', radius: 'md' },
      styles: { root: { fontWeight: 600, '&:active': { transform: 'scale(0.97)' } } },
    },
    // ...
  },
});
```

### 10.3 CSS Variables for Theming (`global.css`)

Global CSS variables are defined for light and dark modes, used throughout the application to ensure theme consistency. The `data-mantine-color-scheme` attribute drives the dark mode.

```css
:root {
  --app-bg: #f8fafc;
  --app-surface: #ffffff;
  --app-text: #0f172a;
  /* ... */
}

[data-mantine-color-scheme="dark"] {
  --app-bg: #0f172a;
  --app-surface: #1e293b;
  --app-text: #f8fafc;
  /* ... */
}
```

### 10.4 Tailwind Integration

The `mantineTheme.css` file bridges Tailwind with Mantine by mapping Mantine CSS variables to Tailwind utilities, enabling the use of Mantine colors in Tailwind classes.

---

## 11. Real-Time Features with SSE

### 11.1 Server-Sent Events Setup

The `useEventSse` hook establishes a persistent connection to `/api/events/stream/{eventId}`.

```ts
export function useEventSse(eventId: string | undefined) {
  useEffect(() => {
    if (!eventId) return;
    const token = useAuthStore.getState().accessToken;
    const url = `${baseUrl}/api/events/stream/${eventId}?token=${token}`;
    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener('rsvp-update', (e) => {
      const data: SseEventData = JSON.parse(e.data);
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      // Show notifications for capacity changes, etc.
    });

    es.addEventListener('waitlist-update', (e) => {
      // Handle waitlist promotion
    });

    es.addEventListener('event-cancelled', () => {
      // Handle cancellation
    });

    es.onerror = () => {
      es.close();
      setTimeout(connect, 5000); // Auto-reconnect
    };

    return () => es.close();
  }, [eventId]);
}
```

### 11.2 Why SSE over WebSockets?

- **Simplicity**: SSE is easier to implement for unidirectional streaming.
- **Automatic Reconnection**: Browsers handle reconnection natively.
- **HTTP-based**: Works with existing authentication and load balancers.
- **Sufficient**: The use case is mainly push notifications; bidirectional communication is not required.

### 11.3 Integration with React Query

SSE events invalidate relevant query keys, causing React Query to refetch fresh data. This ensures the UI always reflects the latest server state without manual polling.

---

## 12. Performance Optimizations

### 12.1 Image Loading

- **ProgressiveImage**: Shows a skeleton while the image loads, then fades in.
- **Lazy Loading**: Images are only loaded when they enter the viewport (via `react-lazyload` or browser native `loading="lazy"` – though the current code uses `Image` component from Mantine which handles it).
- **Thumbnails**: Backend provides thumbnail and medium-size URLs for event media to reduce bandwidth.

### 12.2 Code Splitting

- **Route-based splitting**: React Router's `lazy` is not yet used, but the structure allows easy implementation.
- **Tree Shaking**: Vite and ES modules enable dead code elimination.

### 12.3 Infinite Scroll

The `EventFeed` uses `useInView` to trigger `fetchNextPage` when the sentinel element becomes visible, reducing the number of API calls and improving perceived performance.

### 12.4 Memoization

- **React.memo**: Used on pure functional components where appropriate.
- **useMemo / useCallback**: Used for expensive computations and stable callbacks.

### 12.5 React Query Caching

- **staleTime**: 5 minutes prevents unnecessary refetches.
- **gcTime**: 30 minutes keeps unused data in cache for quick re-fetch.
- **Background refetch**: On window focus (disabled to avoid noise) and after mutations.

### 12.6 Bundle Size Optimization

- **Mantine**: Only imports used components and styles.
- **Tree Shaking**: ES modules and Vite's build process eliminate unused exports.

---

## 13. Mobile Responsiveness

### 13.1 Tailwind Breakpoints

Tailwind's utility classes (`sm:`, `md:`, `lg:`) are used for layout adjustments across screen sizes.

### 13.2 Mantine Hooks

- `useMediaQuery` to conditionally render components (e.g., hide desktop search on mobile).
- `useHeadroom` to hide navbar on scroll down.

### 13.3 Mobile-Specific Components

- **MobileBottomNav**: Persistent bottom navigation bar on mobile (replaces desktop navbar).
- **Drawer**: Hamburger menu on mobile.
- **Responsive Grids**: `SimpleGrid` and `Grid` with responsive column definitions.

### 13.4 Adaptive Layouts

- **PageLayout**: Adds `pb={isMobile ? 80 : 0}` to the main content to avoid overlap with bottom nav.
- **AuthLayout**: Collapses to single column on mobile.

---

## 14. Error Handling & Resilience

### 14.1 Global Error Boundaries

The application uses React Query's error handling and Mantine's `ErrorBoundary` (implicitly via `react-error-boundary` not used, but can be added). For now, errors are caught at the component level.

### 14.2 API Error Handling

- Axios interceptors catch network errors and token expiry.
- Each mutation/query has `onError` callbacks that display user-friendly notifications.
- API responses include a `message` field that is displayed to the user.

### 14.3 Form Validation

- Mantine's `useForm` with custom validation ensures data integrity before submission.
- Backend validation errors are caught and displayed in notifications.

### 14.4 Fallback UI

- **Loading**: Skeleton loaders and spinners.
- **Empty States**: Informative messages with actions.
- **Error Pages**: 404 and generic error pages.

### 14.5 Resilience Strategies

- **Retry Logic**: React Query's `retry` is set to 1.
- **Offline Support**: Not implemented yet but could be added with service workers.
- **Auto-Reconnect**: SSE reconnects after 5 seconds on error.

---

## 15. Development Tooling & Build

### 15.1 Build Tool: Vite

Vite offers fast HMR and optimized builds.

**Configuration:**
```ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
```

### 15.2 TypeScript

Strict mode is enabled, ensuring high type safety.

### 15.3 Linting & Formatting

- ESLint with recommended rules.
- Prettier is assumed (not configured in provided files).

### 15.4 Environment Variables

Environment variables are prefixed with `VITE_` to be accessible in the client.

```bash
VITE_API_URL=http://localhost:8081
```

---

## 16. Security Considerations

### 16.1 Token Storage

- Access and refresh tokens are stored in **localStorage** (via Zustand persist). This exposes them to XSS attacks, but the app uses `HttpOnly` cookies for session tokens in some contexts? Actually, the frontend uses Bearer tokens in headers, stored in localStorage. This is considered acceptable for many SPAs with proper CSP headers.

### 16.2 CSRF Protection

- With JWT tokens stored in localStorage, CSRF is less of a concern because the token is sent in the `Authorization` header, not automatically included by browsers. However, CSRF tokens are not implemented; the backend may rely on CORS and SameSite cookies for additional security.

### 16.3 Role-Based Access Control

- Frontend checks `user.role === 'ADMIN'` to show admin routes and UI elements. However, sensitive admin actions are also protected on the backend by Spring Security, ensuring that even if the UI is bypassed, the API enforces authorization.

### 16.4 Input Validation

- All forms use client-side validation (regex, length checks). Backend validation is assumed to be stricter.

### 16.5 HTTPS

- In production, the application should be served over HTTPS to prevent token interception.

### 16.6 Content Security Policy (CSP)

- Not explicitly set, but can be added via meta tags or server headers.

---

## 17. Future Roadmap & Improvements

### 17.1 Short-Term

- **Add React Error Boundary** for graceful failure handling.
- **Implement route-based code splitting** with `React.lazy`.
- **Improve test coverage** (unit and integration tests).
- **Add service worker for offline support** (PWA already set up).

### 17.2 Medium-Term

- **Replace polling for notifications with WebSocket** for truly real-time experience.
- **Add analytics** (e.g., Google Analytics or Plausible).
- **Internationalization (i18n)** – currently German/English mixed.
- **User settings** for email preferences (already partially implemented).

### 17.3 Long-Term

- **Migration to React Server Components** (when framework supports).
- **Micro-frontend architecture** for admin and student apps.
- **AI-based event recommendations**.
- **Social features** (follow hosts, share events).

---

## 18. Conclusion

The MyStudyApp frontend is a well-architected, production-ready application that demonstrates strong software engineering practices:

- **Modularity**: Clear separation of concerns via Atomic Design, domain-driven API modules, and custom hooks.
- **Performance**: Efficient data fetching with React Query, infinite scroll, image optimization, and caching strategies.
- **User Experience**: Responsive design, dark mode, smooth animations, real-time updates.
- **Security**: JWT-based authentication with automatic refresh, route protection, and role-based access.
- **Maintainability**: TypeScript, consistent coding patterns, centralized constants, and design tokens.

The codebase is structured to allow easy addition of new features and is poised for future enhancements. The development team has leveraged modern React ecosystem tools effectively, resulting in a robust and delightful user experience for the campus community.
# TODO - Spot2 Frontend Implementation

## Phase 1: Project Setup & Configuration

- [x] **Setup project base structure and configuration**
  - Create src/ directory with features/, shared/, api/ folders
  - Setup package.json with scripts

- [x] **Install dependencies (ALWAYS use pnpm, not npm)**
  ```bash
  pnpm install react react-dom react-router-dom
  pnpm install @tanstack/react-query axios
  pnpm install tailwindcss @tailwindcss/forms
  pnpm install -D typescript @types/react @types/react-dom
  pnpm install -D vite @vitejs/plugin-react
  pnpm install -D @biomejs/biome
  pnpm install -D jest @testing-library/react @testing-library/jest-dom
  pnpm install -D cypress
  pnpm install class-variance-authority clsx tailwind-merge
  ```

- [x] **Configure Vite, TypeScript, and path aliases**
  - Create vite.config.ts with @ alias pointing to src/
  - Configure tsconfig.json with strict mode and path mapping
  - Setup jsconfig.json for better IDE support

- [x] **Setup TailwindCSS and shadcn/ui**
  - Initialize Tailwind: `pnpm dlx tailwindcss init -p`
  - Configure tailwind.config.js with content paths
  - Create index.css with @tailwind directives
  - Initialize shadcn/ui: `pnpm dlx shadcn-ui@latest init`

---

## Phase 2: API Layer & Type Definitions

- [x] **Create API client (src/api/client.ts)**
  - Axios instance with baseURL from VITE_API_URL
  - Request interceptor: add Authorization header with token from localStorage
  - Response interceptor: handle 401 errors (clear token, redirect to login)
  - Set 10s timeout

- [x] **Define TypeScript types (src/shared/types/api.types.ts)**
  ```typescript
  // ShortenedUrl interface (id, short_code, original_url, etc)
  // CreateUrlRequest, UpdateUrlRequest
  // UrlAnalytics interface (total_clicks, unique_clicks, clicks_by_date, etc)
  // AuthUser, LoginRequest, LoginResponse
  // PaginatedResponse<T>
  ```

- [x] **Implement Auth API (src/api/auth.ts)**
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/me
  - POST /api/auth/refresh

- [x] **Implement URLs API (src/api/urls.ts)**
  - POST /api/urls (create)
  - GET /api/urls (list with pagination/filters)
  - GET /api/urls/{shortCode} (show)
  - DELETE /api/urls/{shortCode} (delete)

- [x] **Implement Analytics API (src/api/analytics.ts)**
  - GET /api/urls/{shortCode}/analytics

- [x] **Implement QR Code API (src/api/qrcode.ts)**
  - GET /api/urls/{shortCode}/qr (returns image URL or base64)

---

## Phase 3: Routing & Shared Components

- [x] **Setup React Router (src/router.tsx)**
  - Route: / → CreateUrlPage
  - Route: /urls → UrlListPage
  - Route: /analytics/:shortCode → AnalyticsDetailPage
  - Route: /:shortCode → RedirectPage (handles redirect)
  - Route: /login → LoginPage
  - Protected routes wrapper for authenticated pages

- [x] **Install shadcn/ui components**
  ```bash
  pnpm dlx shadcn-ui@latest add button
  pnpm dlx shadcn-ui@latest add input
  pnpm dlx shadcn-ui@latest add table
  pnpm dlx shadcn-ui@latest add dialog
  pnpm dlx shadcn-ui@latest add card
  pnpm dlx shadcn-ui@latest add toast
  pnpm dlx shadcn-ui@latest add dropdown-menu
  pnpm dlx shadcn-ui@latest add label
  ```

- [x] **Create shared utility hooks**
  - src/shared/hooks/useClipboard.ts (copy text, show toast feedback)
  - src/shared/hooks/useDebounce.ts (delay value updates)
  - src/shared/hooks/useLocalStorage.ts (persist state to localStorage)
  - src/shared/hooks/useToast.ts (wrapper for shadcn/ui toast)

- [x] **Create shared utility functions**
  - src/shared/utils/formatDate.ts (format ISO dates to readable format)
  - src/shared/utils/validateUrl.ts (URL validation regex)
  - src/shared/utils/formatNumber.ts (format numbers with commas)
  - src/shared/utils/cn.ts (Tailwind class name merger - clsx + tailwind-merge)

---

## Phase 4: Authentication Feature

- [x] **Create Auth context/hooks**
  - src/features/auth/hooks/useAuth.ts (login, logout, me, refresh with TanStack Query)
  - Store token in localStorage
  - Provide user state globally

- [x] **Create LoginPage component**
  - src/features/auth/pages/LoginPage.tsx
  - Email/password form with validation (LoginForm component)
  - Call useAuth login mutation
  - Redirect to / on success

- [x] **Create ProtectedRoute component**
  - Check if user is authenticated
  - Redirect to /login if not authenticated

- [ ] **Write tests for Auth**
  - src/features/auth/__tests__/useAuth.test.ts
  - src/features/auth/__tests__/LoginPage.test.tsx

---

## Phase 5: URL Shortener Feature

- [x] **Create CreateUrlForm component**
  - src/features/url-shortener/components/CreateUrlForm.tsx
  - Fields: original_url (required), custom_alias (optional), expires_at (optional)
  - Client-side validation (URL format, max length)
  - Show validation errors below inputs
  - Loading state on submit button

- [x] **Create TanStack Query hooks for URLs**
  - src/features/url-shortener/hooks/useCreateUrl.ts (useMutation)
  - src/features/url-shortener/hooks/useUrlList.ts (useQuery with pagination)
  - src/features/url-shortener/hooks/useDeleteUrl.ts (useMutation)
  - src/features/url-shortener/hooks/useUrlByShortCode.ts (useQuery)
  - Invalidate queries on success, show toast notifications

- [x] **Create UrlList component**
  - src/features/url-shortener/components/UrlList.tsx
  - Display list of shortened URLs (card-based layout)
  - Pagination controls
  - Loading and empty states

- [x] **Create UrlListItem component**
  - src/features/url-shortener/components/UrlListItem.tsx
  - Display short_code, original_url, click_count, created_at, expires_at
  - Copy button (uses useClipboard hook)
  - Delete button with confirmation dialog
  - Link to analytics page and QR code page

- [x] **Create QrCodeDisplay component**
  - src/features/url-shortener/components/QrCodeDisplay.tsx
  - Fetch QR code image from API
  - Display in modal/dialog
  - Download button

- [x] **Create URL shortener pages**
  - src/features/url-shortener/pages/CreateUrlPage.tsx (includes CreateUrlForm)
  - src/features/url-shortener/pages/UrlListPage.tsx (includes UrlList)

- [x] **Write tests for URL Shortener**
  - src/features/url-shortener/__tests__/CreateUrlForm.test.tsx
  - src/features/url-shortener/__tests__/UrlList.test.tsx
  - src/features/url-shortener/__tests__/hooks/useCreateUrl.test.ts

---

## Phase 6: Analytics Feature

- [x] **Create useUrlAnalytics hook**
  - src/features/analytics/hooks/useUrlAnalytics.ts
  - useQuery with shortCode parameter
  - Fetch analytics data with staleTime: 30s

- [x] **Create ClickTimelineChart component**
  - src/features/analytics/components/ClickTimelineChart.tsx
  - Line/bar chart showing clicks over time
  - Use clicks_by_date data
  - Consider using recharts or chart.js library

- [x] **Create GeographyMap component**
  - src/features/analytics/components/GeographyMap.tsx
  - Display clicks_by_country data
  - Simple list or map visualization

- [x] **Create DeviceBreakdown component**
  - src/features/analytics/components/DeviceBreakdown.tsx
  - Pie chart or bar chart for clicks_by_device

- [x] **Create ReferrerList component**
  - src/features/analytics/components/ReferrerList.tsx
  - Table showing top_referrers data

- [x] **Create AnalyticsDetailPage**
  - src/features/analytics/pages/AnalyticsDetailPage.tsx
  - Get shortCode from route params
  - Display URL details (original_url, short_code, total clicks)
  - Show all analytics components
  - Back button to URL list

- [ ] **Write tests for Analytics**
  - src/features/analytics/__tests__/AnalyticsDetailPage.test.tsx
  - src/features/analytics/__tests__/hooks/useUrlAnalytics.test.ts

---

## Phase 7: Redirect Feature

- [x] **Create RedirectPage component**
  - src/features/redirect/pages/RedirectPage.tsx
  - Get shortCode from route params
  - Fetch URL from GET /api/urls/{shortCode}
  - Show loading spinner while fetching
  - Redirect to original_url using window.location.href
  - Handle 404 errors (invalid short code)

---

## Phase 8: Layout & Global Components

- [x] **Create Layout component**
  - src/shared/components/Layout.tsx
  - Header with navigation
  - User menu (if authenticated)
  - Logout button
  - Main content area
  - Footer

- [x] **Create Header component**
  - src/shared/components/Header.tsx
  - Logo/brand
  - Navigation links (Create URL, My URLs)
  - User avatar with dropdown menu

- [x] **Create ErrorBoundary component**
  - src/shared/components/ErrorBoundary.tsx
  - Catch React errors
  - Display friendly error message
  - Log errors to console (or error tracking service)

- [x] **Create LoadingSpinner component**
  - src/shared/components/LoadingSpinner.tsx
  - Used in Suspense fallback
  - Used in loading states

---

## Phase 9: Testing Setup & Unit Tests

- [ ] **Setup Jest configuration**
  - Create jest.config.js
  - Configure moduleNameMapper for @ alias
  - Setup test environment (jsdom)
  - Add test scripts to package.json

- [ ] **Write unit tests for components**
  - CreateUrlForm: rendering, validation, submission
  - UrlList: rendering, pagination, search
  - AnalyticsDetailPage: data display

- [ ] **Write unit tests for hooks**
  - useClipboard: copy functionality, toast feedback
  - useDebounce: value delay, cleanup
  - useCreateUrl: mutation, cache invalidation
  - useUrlList: query, pagination

- [ ] **Write unit tests for utilities**
  - validateUrl: valid/invalid URLs
  - formatDate: different date formats
  - formatNumber: number formatting with commas

---

## Phase 10: E2E Testing with Cypress

- [ ] **Setup Cypress**
  - Initialize: `pnpm dlx cypress open`
  - Configure baseUrl in cypress.config.ts
  - Create custom commands in cypress/support/commands.ts
  - Add fixtures for test data

- [ ] **Write E2E test for URL shortening flow**
  - cypress/e2e/shorten-url.cy.ts
  - Visit homepage
  - Fill CreateUrlForm with valid URL
  - Submit form
  - Verify shortened URL appears in list
  - Test copy button
  - Test redirect (verify href attribute)

- [ ] **Write E2E test for custom alias**
  - Create URL with custom alias
  - Verify alias is used instead of generated code

- [ ] **Write E2E test for analytics viewing**
  - cypress/e2e/analytics.cy.ts
  - Create a URL
  - Navigate to analytics page
  - Verify analytics data displays
  - Check charts render

- [ ] **Write E2E test for validation errors**
  - Test invalid URL format
  - Test empty required fields
  - Verify error messages display

---

## Phase 11: Production Configuration

- [ ] **Configure environment variables**
  - Create .env.example with all VITE_* variables
  - Document required variables in README
  - VITE_API_URL, VITE_APP_ENV

- [ ] **Setup Biome for linting and formatting**
  - Initialize Biome: `pnpm dlx @biomejs/biome init`
  - Configure biome.json with React/TypeScript rules
  - Add lint and format scripts to package.json:
    - `"lint": "biome lint ./src"`
    - `"format": "biome format --write ./src"`
    - `"check": "biome check --write ./src"`
  - Configure pre-commit hooks (optional: husky + lint-staged)

- [ ] **Configure production build**
  - Optimize Vite build settings
  - Enable code splitting (lazy load routes with React.lazy)
  - Configure TanStack Query for production (staleTime, cacheTime)
  - Test build: `npm run build && npm run preview`

- [ ] **Create nginx.conf for production**
  - Serve static files from /usr/share/nginx/html
  - SPA fallback: try_files $uri /index.html
  - Configure gzip compression
  - Add security headers

- [ ] **Test Docker build**
  - Build image: `docker build -t spot2-frontend -f Dockerfile .`
  - Run container: `docker run -p 80:80 -e VITE_API_URL=http://localhost:8000/api spot2-frontend`
  - Verify all features work in containerized environment

---

## Phase 12: Integration & Final Testing

- [ ] **Verify backend integration**
  - Test against actual backend API (not mocks)
  - Verify CORS configuration allows frontend origin
  - Test authentication flow end-to-end
  - Test all CRUD operations for URLs

- [ ] **Test health check endpoint**
  - Verify GET /api/health returns 200
  - Use in monitoring/uptime checks

- [ ] **Final QA checklist**
  - [ ] All forms validate correctly
  - [ ] Error messages are user-friendly
  - [ ] Loading states show during API calls
  - [ ] Success/error toasts appear
  - [ ] Clipboard copy works
  - [ ] QR codes generate and download
  - [ ] Analytics charts render with data
  - [ ] Redirect works for valid short codes
  - [ ] 404 page shows for invalid short codes
  - [ ] Responsive design works on mobile
  - [ ] Accessibility: keyboard navigation, ARIA labels

- [ ] **Performance audit**
  - Run Lighthouse audit
  - Check bundle size
  - Verify code splitting works
  - Test on slow 3G network

- [ ] **Code coverage check**
  - Run: `npm run test:coverage`
  - Ensure 80%+ coverage
  - Review uncovered lines

---

## Phase 13: Documentation & Deployment

- [ ] **Update README.md**
  - Project description
  - Setup instructions
  - Available scripts
  - Environment variables
  - Deployment guide

- [ ] **Create deployment documentation**
  - Docker deployment steps
  - Environment variable configuration
  - Nginx setup
  - SSL/TLS configuration (if applicable)

- [ ] **Prepare for CI/CD**
  - Create .github/workflows/frontend-tests.yml
  - Run tests on push/PR
  - Build Docker image
  - Push to registry (if applicable)

---

## Notes

- **ALWAYS use pnpm** (not npm or yarn) for all package management
- Use `pnpm dlx` instead of `npx` for one-time commands
- Follow TDD: Write tests before implementation where possible
- Use TanStack Query for ALL server state (no useState for API data)
- Keep components under 200 lines
- Extract complex logic to custom hooks
- Use TypeScript strictly (no `any` types)
- Commit frequently with clear messages
- Update this TODO as you complete tasks

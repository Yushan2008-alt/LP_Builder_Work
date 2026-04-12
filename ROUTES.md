# ROUTES.md - LP Block Builder Engine
## Complete Route Map for React Router DOM v6

Generated: 2026-04-06
Target: react-router-dom v6+

---

## 1. Route Table

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/login` | LoginPage | No | Email-based authentication with Supabase. Social login (Phase 2). |
| `/` | RootRedirect -> /products | Yes | Redirects to `/products` (dashboard landing). |
| `/products` | ProductDashboard | Yes | Brand & product management hub. CRUD operations for brands, products, and brand guidelines. Brand editing handled via BrandGuidelinesModal (modal overlay). |
| `/generator` | GeneratorRedirect -> /generator/new | Yes | Redirects to `/generator/new` (formula gallery entry point). |
| `/generator/new` | FormulaGallery | Yes | Pick formula (20 options) or Custom blank canvas. Displays grid with tier grouping, search filter, skeleton previews. |
| `/generator/:projectId` | SectionPlanner | Yes | Edit existing project. Section cards (drag-reorder), layout picker, style toggles, additional context. OutputPanel embedded within SectionPlanner (split view). |
| `/saved` | SavedProjectsList | Yes | List of max 4 saved projects (name, formula, last edited). Click to open in SectionPlanner. |
| `/editor` | HtmlEditor | Yes | Live HTML/CSS editor with split-panel layout (code left, live preview right). Paste output from LP Generator or start fresh. Monaco Editor or CodeMirror with DOMPurify sanitization. |

---

## 2. Auth Flow

### Supabase Auth Integration

**Provider**: Supabase Auth
**MVP Methods**: Email/password login
**Phase 2**: Social OAuth (Google, GitHub)
**Session Storage**: Supabase manages JWT tokens in localStorage (`sb-auth-token`)

### Protected Route Wrapper Component

```typescript
// Example ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuthContext();

  if (isLoading) return <LoadingSpinner />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

### Login Success Redirect

- User submits email/password on `/login`
- Supabase confirms session
- Router navigates to `/` (RootRedirect)
- RootRedirect checks session and navigates to `/products`

### Logout Behavior

1. User clicks logout button (typically in sidebar or header)
2. AuthContext clears Supabase session: `supabase.auth.signOut()`
3. Clear all context state (products, projects, settings)
4. Navigate to `/login` with `replace: true`
5. localStorage auth token removed by Supabase

### Session Persistence

- Supabase handles session token persistence via localStorage
- On app load, check `supabase.auth.getSession()`
- If valid session exists, skip login and proceed to `/products`
- If session expired, redirect to `/login` on any protected route access

---

## 3. Navigation Guards

### Unsaved Changes Detection

**State Flag**: `project.is_dirty` (boolean, React state only—NOT persisted to DB)

**Set to true when**:
- User edits section title
- User edits section goals
- User reorders sections
- User adds/deletes a section
- User changes layout format
- User toggles style mode (Default ↔ Custom)
- User modifies additional context
- User changes product selection

**Set to false when**:
- User clicks "Save" button (project persisted to DB)

### Browser Beforeunload Warning

```typescript
// Example in SectionPlanner component
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = 'Kamu punya perubahan yang belum disimpan. Yakin mau keluar?';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

### Route Change Guard (useBlocker)

React Router v6.4+ provides `useBlocker` hook to prompt on client-side route changes:

```typescript
// Example in SectionPlanner component
import { useBlocker } from 'react-router-dom';

function SectionPlanner() {
  const [isDirty, setIsDirty] = useState(false);

  useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Alternative: unstable_usePrompt (if useBlocker unavailable)
  // usePrompt(
  //   isDirty ? 'Kamu punya perubahan yang belum disimpan. Yakin mau keluar?' : ''
  // );

  return (
    // JSX
  );
}
```

**Behavior**: If user tries to navigate away (click sidebar link, back button, etc.) while isDirty=true, show confirmation dialog. User can cancel navigation or confirm exit (losing unsaved changes).

### Generate Button Disabled Conditions

Generate button is disabled if ANY of these conditions are true:

- No product selected in SectionPlanner
- Zero sections defined (empty project)
- Current section has empty section_title
- Current section has empty section_goals
- Current section has no layout_format selected

```typescript
// Example disable logic
const canGenerate =
  selectedProduct &&
  sections.length > 0 &&
  sections.every(sec => sec.title && sec.goals && sec.layout_format);

return <button disabled={!canGenerate}>Generate</button>;
```

---

## 4. Route Parameters & Query Strings

### Dynamic Route Parameters

#### `:projectId` (UUID)
- **Used in**: `/generator/:projectId`
- **Type**: UUID string (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **Purpose**: Load specific project from Supabase `projects` table
- **Extraction**: `const { projectId } = useParams<{ projectId: string }>()`
- **Validation**: Must exist in DB and belong to current user_id (enforced server-side)

### Query String Parameters

#### `?framework=<formula_key>` (optional, FormulaGallery only)
- **Used in**: `/generator/new?framework=aidca`
- **Type**: String key from formula registry (e.g., `aida`, `aidca`, `pastor`, `custom`)
- **Purpose**: Deep linking / pre-select formula from external link
- **Example**: `https://app.vibecode.io/generator/new?framework=aidca` auto-selects AIDCA formula
- **Fallback**: If invalid key, show full gallery
- **Implementation**:

```typescript
// FormulaGallery.tsx
import { useSearchParams } from 'react-router-dom';

function FormulaGallery() {
  const [searchParams] = useSearchParams();
  const preSelectedFormula = searchParams.get('framework');

  useEffect(() => {
    if (preSelectedFormula && isValidFormula(preSelectedFormula)) {
      handleFormulaSelect(preSelectedFormula);
    }
  }, [preSelectedFormula]);
}
```

#### `?mode=copy` (optional, SectionPlanner only)
- **Used in**: `/generator/:projectId?mode=copy`
- **Type**: String (`html` or `copy`)
- **Purpose**: Override default output mode (HTML)
- **Example**: `https://app.vibecode.io/generator/abc123?mode=copy` loads project in Copy mode
- **Default**: HTML mode (if param omitted)

---

## 5. Redirect Logic

| From | To | Condition | Implementation |
|---|---|---|---|
| `/login` | `/` | User already authenticated (session exists) | `<Navigate to="/" replace />` in LoginPage useEffect |
| `/` (RootRedirect) | `/products` | Always (landing redirect) | `<Navigate to="/products" replace />` |
| `/generator` (GeneratorRedirect) | `/generator/new` | Always (entry point redirect) | `<Navigate to="/generator/new" replace />` |
| Any protected route | `/login` | User not authenticated (no session) | ProtectedRoute wrapper returns `<Navigate to="/login" replace />` |
| `/saved` | `/generator/:projectId` | User clicks project in list | `navigate('/generator/${project.id}')` onClick handler |

### Implementation: Redirect Components

```typescript
// RootRedirect.tsx - Redirects to ProductDashboard
export function RootRedirect() {
  return <Navigate to="/products" replace />;
}

// GeneratorRedirect.tsx - Redirects to FormulaGallery
export function GeneratorRedirect() {
  return <Navigate to="/generator/new" replace />;
}
```

### Implementation: Route Configuration (createBrowserRouter)

```typescript
// App.tsx - Main router configuration using createBrowserRouter
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootRedirect } from './components/RootRedirect';
import { GeneratorRedirect } from './components/GeneratorRedirect';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/products',
    element: <ProtectedRoute><ProductDashboard /></ProtectedRoute>,
  },
  {
    path: '/generator',
    element: <GeneratorRedirect />,
  },
  {
    path: '/generator/new',
    element: <ProtectedRoute><FormulaGallery /></ProtectedRoute>,
  },
  {
    path: '/generator/:projectId',
    element: <ProtectedRoute><SectionPlanner /></ProtectedRoute>,
  },
  {
    path: '/saved',
    element: <ProtectedRoute><SavedProjectsList /></ProtectedRoute>,
  },
  {
    path: '/editor',
    element: <ProtectedRoute><HtmlEditor /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
```

---

## 6. Layout Structure

### Overall App Layout

```
┌──────────────────────────────────────────────────────────┐
│ Header (if applicable)                                   │
├──────────────────────────────────────────┬───────────────┤
│ Sidebar (260px, left-aligned)            │ Main Content  │
│                                          │ (flex-grow)   │
│ Routes:                                  │               │
│  • /login (hidden)                       │ ◄─ Route      │
│  • /products                             │    component  │
│  • /products/brand/:brandId              │    renders    │
│  • /generator/new                        │    here       │
│  • /generator/:projectId                 │               │
│  • /saved                                │               │
│  • /editor                               │               │
│                                          │               │
└──────────────────────────────────────────┴───────────────┘
```

### Sidebar Visibility Map

| Route | Sidebar Visible | Navigation Context |
|---|---|---|
| `/login` | No | Full-page login form, no sidebar |
| `/products` | Yes | Sidebar + ProductDashboard in main area. Brand editing via BrandGuidelinesModal (overlay). |
| `/generator/new` | Yes | Sidebar + FormulaGallery grid in main area |
| `/generator/:projectId` | Yes | Sidebar + SectionPlanner split-view (left: sections, right: OutputPanel) in main area |
| `/saved` | Yes | Sidebar + SavedProjectsList in main area |
| `/editor` | Yes | Sidebar + HtmlEditor split-panel (code + preview) in main area |

### Layout Wrapper Pattern

```typescript
// MainLayout.tsx - wraps all protected routes
import { useAuthContext } from './AuthContext';

export function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();

  if (!user) return null; // or redirect to login

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// App.tsx - route configuration with layout wrapper (alternative approach)
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <RootRedirect /> },
      { path: '/products', element: <ProductDashboard /> },
      { path: '/generator', element: <GeneratorRedirect /> },
      { path: '/generator/new', element: <FormulaGallery /> },
      { path: '/generator/:projectId', element: <SectionPlanner /> },
      { path: '/saved', element: <SavedProjectsList /> },
      { path: '/editor', element: <HtmlEditor /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
```

---

## 7. State Management & Context

### Auth Context

```typescript
// AuthContext.ts
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Product Context (optional, for global access to brands/products)

```typescript
// ProductContext.ts
interface ProductContextType {
  brands: Brand[];
  products: Product[];
  selectedBrand: Brand | null;
  selectedProduct: Product | null;
  setSelectedBrand: (brand: Brand) => void;
  setSelectedProduct: (product: Product) => void;
  refreshProducts: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType>(null!);
```

### Project Context (for SectionPlanner state)

```typescript
// ProjectContext.ts
interface ProjectContextType {
  project: Project;
  sections: Section[];
  isDirty: boolean;
  setProject: (project: Project) => void;
  setSections: (sections: Section[]) => void;
  setIsDirty: (dirty: boolean) => void;
  addSection: (section: Section) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (newOrder: Section[]) => void;
  saveProject: () => Promise<void>;
}
```

---

## 8. Error Handling & Edge Cases

### 404 Not Found

```typescript
// NotFound.tsx
export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Halaman tidak ditemukan</p>
      <Link to="/" className="mt-4 text-blue-500 underline">
        Kembali ke home
      </Link>
    </div>
  );
}
```

### Project Not Found (SectionPlanner with invalid :projectId)

```typescript
// SectionPlanner.tsx
function SectionPlanner() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setNotFound(true);
      return;
    }

    const loadProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setProject(data);
    };

    loadProject();
  }, [projectId]);

  if (notFound) {
    return (
      <div>
        <h1>Proyek tidak ditemukan</h1>
        <Link to="/saved">Kembali ke daftar proyek</Link>
      </div>
    );
  }

  return (
    // SectionPlanner UI
  );
}
```

### Session Expired During Navigation

```typescript
// In ProtectedRoute or app-level error boundary
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login', { replace: true });
    }
  };

  checkSession();
}, [navigate]);
```

---

## 9. Deep Linking Examples

### Create New LP with Pre-selected Formula

```
https://app.vibecode.io/generator/new?framework=aidca
```

Result: FormulaGallery loads, AIDCA card is pre-selected/highlighted.

### Open Existing Project in Copy Mode

```
https://app.vibecode.io/generator/550e8400-e29b-41d4-a716-446655440000?mode=copy
```

Result: SectionPlanner loads project, output mode set to "Copy" (text-only).

### Direct Link from External Landing Page

```
https://app.vibecode.io/login?next=/generator/new?framework=pastor
```

Result: After login, redirect to `/generator/new?framework=pastor` (requires router enhancement to handle `next` param).

---

## 10. Testing Routes

### Webhook E2E Quick Check (create-user)

Jalankan satu command berikut untuk verifikasi otomatis endpoint webhook `POST /api/webhooks/create-user` (cek HTTP status + field wajib sukses):

```bash
npm run verify:webhook:create-user
```

Catatan env:
- `WEBHOOK_SECRET` wajib tersedia (bisa dari shell env atau `.env.local`)
- `WEBHOOK_BASE_URL` opsional (default: `NEXT_PUBLIC_SITE_URL`, fallback `http://localhost:3000`)

### Route-Testing Checklist

- [ ] `/login` loads without auth, redirects to `/products` after login
- [ ] `/` redirects to `/products` (authenticated)
- [ ] `/products` requires auth, shows ProductDashboard
- [ ] BrandGuidelinesModal renders as overlay on ProductDashboard (no separate route)
- [ ] `/generator` redirects to `/generator/new`
- [ ] `/generator/new` loads FormulaGallery, `?framework=xxx` pre-selects formula
- [ ] `/generator/new?framework=invalid` shows full gallery without error
- [ ] `/generator/:projectId` loads SectionPlanner with OutputPanel embedded (split-view)
- [ ] `/generator/:invalidId` shows 404 or "project not found"
- [ ] `/generator/:projectId?mode=copy` overrides output mode
- [ ] `/saved` shows max 4 projects, clicking one navigates to `/generator/:projectId`
- [ ] `/editor` loads HtmlEditor without error
- [ ] All protected routes redirect to `/login` if not authenticated
- [ ] `beforeunload` fires when isDirty=true and user closes tab
- [ ] `useBlocker` fires when isDirty=true and user clicks sidebar link
- [ ] Logout clears session and redirects to `/login`
- [ ] Deep links work: `/generator/new?framework=aidca`, etc.

---

## 11. Migration & Deployment Notes

### Pre-Deployment Checklist

1. **Environment Variables** (.env.local):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL`

2. **Supabase Setup**:
   - Auth enabled (email/password)
   - RLS policies configured (brands, products, projects, sections tables)
   - Max brands (3), products (10), projects (4) enforced via triggers or application logic

3. **Router v6 Compatibility**:
   - Use `createBrowserRouter` (not `BrowserRouter` for better error handling)
   - Implement outlet-based layout nesting if using new data APIs
   - Use `useNavigate`, `useParams`, `useSearchParams` consistently

4. **Session Persistence**:
   - Test localStorage token persistence across page reloads
   - Test session recovery on app restart
   - Test logout clearing all auth state

5. **Build & Bundling**:
   - Vite bundles routes with code splitting for faster load times
   - Consider lazy loading heavy components (Editor, FormulaGallery) with `React.lazy()` + `Suspense`

---

## Summary

This ROUTES.md defines a complete, production-ready routing system for the LP Block Builder Engine. All routes are protected where appropriate, auth flow is Supabase-native, unsaved changes are guarded, and deep linking is supported for seamless external integration. Implement using react-router-dom v6+ with the patterns and code examples provided.

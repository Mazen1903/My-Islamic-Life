# Project Structure

## Root Level Organization
```
├── app/                    # Expo Router screens (file-based routing)
├── src/                    # Source code organized by domain
├── assets/                 # Static assets (images, fonts)
├── .expo/                  # Expo configuration and cache
└── .kiro/                  # Kiro AI assistant configuration
```

## App Directory (Expo Router)
File-based routing structure:
```
app/
├── (tabs)/                 # Tab navigation group
├── auth/                   # Authentication screens
├── reading/                # Reading-related screens
├── _layout.tsx             # Root layout component
├── index.tsx               # Home/landing screen
├── onboarding.tsx          # User onboarding flow
├── settings.tsx            # App settings
└── +not-found.tsx          # 404 error screen
```

## Source Code Architecture
Feature-based organization with shared utilities:

```
src/
├── shared/                 # Cross-cutting concerns
│   ├── types/             # TypeScript type definitions
│   ├── services/          # Business logic and API calls
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   ├── contexts/          # React context providers
│   ├── constants/         # App constants (like supplications data)
│   └── config/            # Configuration files
├── features/              # Feature-based modules
│   ├── auth/              # Authentication feature
│   ├── community/         # Community features
│   ├── library/           # Reading library
│   ├── profile/           # User profile management
│   └── reading/           # Reading experience
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components
│   └── __tests__/         # Component tests
└── assets/                # Source-level assets
    ├── fonts/             # Custom fonts
    └── images/            # Images used in components
```

## Key Architectural Patterns

### Import Aliases
TypeScript path mapping configured for clean imports:
- `@/*` - Root level imports
- `@/shared/*` - Shared utilities
- `@/components/*` - UI components
- `@/features/*` - Feature modules
- `@/assets/*` - Asset imports

### Feature Organization
Each feature module should contain:
- Components specific to that feature
- Feature-specific hooks
- Types and interfaces
- Services and API calls
- Tests

### Shared Module Guidelines
- `types/` - Global TypeScript definitions
- `services/` - API clients and business logic
- `hooks/` - Reusable React hooks
- `utils/` - Pure utility functions
- `contexts/` - React context providers
- `constants/` - Static data (like Islamic supplications)

## File Naming Conventions
- React components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase starting with 'use' (`useAuth.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`UserType.ts`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## Component Structure
Follow this pattern for React components:
1. Imports (external libraries first, then internal)
2. Type definitions
3. Component implementation
4. Default export
5. Named exports (if any)
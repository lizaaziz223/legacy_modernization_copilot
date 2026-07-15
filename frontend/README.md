# Frontend - AI Legacy Modernization Copilot

Production-ready Next.js 14+ frontend with TypeScript, TailwindCSS, and shadcn/ui.

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Backend API running on `http://localhost:8080`

### Installation & Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Run development server
npm run dev

# Open browser
# Visit http://localhost:3000
```

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run type-check       # Type check with TypeScript
npm test                 # Run Jest tests
npm run test:watch       # Watch mode for tests
npm run test:coverage    # Generate coverage report
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── (dashboard)/        # Dashboard routes group
│   │   ├── (auth)/             # Auth routes group
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── providers.tsx       # Provider setup
│   │   ├── error.tsx           # Error boundary
│   │   └── not-found.tsx       # 404 page
│   │
│   ├── components/             # React components
│   │   ├── common/             # Shared components (Header, Sidebar, etc.)
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── upload/             # Upload feature components
│   │   ├── analysis/           # Analysis feature components
│   │   ├── reports/            # Reports feature components
│   │   ├── architecture-viewer/# Architecture visualization
│   │   └── ui/                 # shadcn/ui components
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API service layer
│   ├── context/                # React Context providers
│   ├── types/                  # TypeScript definitions
│   ├── constants/              # Application constants
│   ├── utils/                  # Utility functions
│   ├── lib/                    # Libraries (API client, etc.)
│   ├── styles/                 # Global and component styles
│   └── providers/              # Custom providers
│
├── public/                     # Static assets
│   ├── images/
│   └── icons/
│
├── tests/                      # Test files
│   ├── unit/
│   └── integration/
│
├── .env.example                # Environment variables example
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.js           # PostCSS configuration
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Features

✅ **Next.js 14** with App Router  
✅ **TypeScript** for type safety  
✅ **TailwindCSS** for styling  
✅ **shadcn/ui** component library  
✅ **Axios API Client** with interceptors  
✅ **React Context** for state management  
✅ **Custom Hooks** (useAsync, useLocalStorage, useDebounce, etc.)  
✅ **Form Validation** with React Hook Form + Zod  
✅ **Dark Mode** support  
✅ **Responsive Design**  
✅ **ESLint & Prettier** for code quality  
✅ **Jest** for unit testing  
✅ **API Integration** with backend  

## Environment Variables

Create `.env.local` based on `.env.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

## Page Routes

- **/** - Landing page
- **/dashboard** - Main dashboard
- **/upload** - Upload artifacts
- **/analysis** - View analysis results
- **/reports** - View and download reports
- **/architecture-viewer** - Visualize architecture
- **/history** - Scan history
- **/settings** - Settings page
- **/login** - Login page
- **/register** - Registration page

## API Integration

API calls are centralized in `src/services/`:

```typescript
import { projectService, scanService } from '@/services';

// Get all projects
const projects = await projectService.list();

// Create a scan
const scan = await scanService.create(projectId);

// Get scan status
const status = await scanService.getStatus(scanId);
```

The API client (`src/lib/api-client.ts`) handles:
- Request/response interceptors
- JWT token injection
- Error handling
- Authentication redirects

## State Management

### Context API
- **AuthContext** (`src/context/auth-context.tsx`) - Authentication state

### Custom Hooks
- **useAsync** - Manage async operations
- **useLocalStorage** - Persist state
- **useDebounce** - Debounce values
- **usePrevious** - Track previous values

## Styling

- **TailwindCSS** for utility-first styling
- **shadcn/ui** for pre-built components
- **CSS modules** optional for component-specific styles
- **Dark mode** with `dark:` prefix support

## Development Workflow

1. **Create a new page**:
   ```bash
   # Create page directory and page.tsx
   mkdir -p src/app/(dashboard)/new-page
   touch src/app/(dashboard)/new-page/page.tsx
   ```

2. **Add a new component**:
   ```bash
   # Create component file
   touch src/components/feature/component-name.tsx
   ```

3. **Add API integration**:
   - Define types in `src/types/`
   - Add endpoint in `src/constants/`
   - Create service in `src/services/`
   - Use in component with `useAsync` hook

4. **Style components**:
   - Use TailwindCSS classes
   - Import shadcn/ui components
   - Add custom styles in `src/styles/`

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Manual Build
```bash
npm run build
npm start
```

## Troubleshooting

### Port already in use
```bash
lsof -i :3000       # Find process
kill -9 <PID>       # Kill process
npm run dev          # Restart
```

### Clear cache
```bash
rm -rf .next
npm run build
npm start
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## Best Practices

1. **Use TypeScript** for all components and utilities
2. **Create barrel exports** (index.ts) for easier imports
3. **Keep components small** and focused on single responsibility
4. **Use hooks** for reusable logic
5. **Centralize API calls** in service layer
6. **Handle errors** gracefully with try-catch
7. **Test critical paths** with unit tests
8. **Follow ESLint** and Prettier rules
9. **Use semantic HTML** for accessibility
10. **Optimize images** and assets

## License

Apache License 2.0

## Support

For issues and feature requests, please check the main project repository.

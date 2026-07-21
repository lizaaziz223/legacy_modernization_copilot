# Folder Structure

## 1. Repository Root

```
legacy_modernization_copilot/
├── backend/                  # Spring Boot 3.3 REST API (Java 21)
├── frontend/                 # Next.js 14 App Router application
├── docs/                     # This documentation set
├── docker-compose.yml        # Local orchestration: mongo + backend + frontend
└── package-lock.json         # Empty root-level workspace stub
```

There is no root-level `README.md` and no `.github/workflows` directory in this repository at the time of writing.

## 2. Backend (`backend/`)

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/ailegacy/modernization/copilot/
│   │   │   ├── AiLegacyModernizationCopilotApplication.java   # @SpringBootApplication entry point
│   │   │   │
│   │   │   ├── domain/                        # Framework-independent business model
│   │   │   │   ├── entities/                  # 18 files — 10 @Document + 8 embedded value objects
│   │   │   │   ├── enums/                     # 8 files — Role, Level, Severity, etc.
│   │   │   │   ├── exceptions/                 # 6 files — DomainException + 5 subclasses
│   │   │   │   ├── repositories/                # 10 files — BaseRepository + 9 contracts
│   │   │   │   └── services/                   # 1 file — BaseDomainService (unused marker)
│   │   │   │
│   │   │   ├── application/                    # Use cases and orchestration
│   │   │   │   ├── use_cases/                   # 24 use cases, grouped by feature:
│   │   │   │   │   ├── auth/                    # Register, Login, RefreshToken, Logout, GetProfile
│   │   │   │   │   ├── project/                 # Upload, List, Get
│   │   │   │   │   ├── detection/                # Detect, Get
│   │   │   │   │   ├── analysis/                 # AnalyzeBusinessLogic, Get (business analysis)
│   │   │   │   │   ├── architecture/             # Analyze, Get
│   │   │   │   │   ├── security/                 # Analyze, Get
│   │   │   │   │   ├── performance/              # Analyze, Get
│   │   │   │   │   ├── planner/                  # Generate, Get
│   │   │   │   │   ├── generator/                # Generate, Get (Spring Boot code)
│   │   │   │   │   └── report/                   # GenerateModernizationReportUseCase
│   │   │   │   ├── orchestrators/                # 1 file — Orchestrator (unused marker)
│   │   │   │   ├── services/                     # BaseApplicationService (marker) + AuthTokenService (real)
│   │   │   │   ├── dto/                          # Empty directory — no files
│   │   │   │   └── mappers/                      # BaseMapper (unused marker) + 9 hand-written mappers
│   │   │   │
│   │   │   ├── interfaces/rest/                 # External communication
│   │   │   │   ├── controllers/                  # 11 @RestController classes
│   │   │   │   ├── dto/                          # Request/response DTOs, grouped by feature
│   │   │   │   │   ├── auth/ · project/ · detection/ · analysis/ · architecture/
│   │   │   │   │   ├── security/ · performance/ · planner/ · generator/
│   │   │   │   │   └── ApiResponse.java, ErrorFieldDto.java
│   │   │   │   └── exception/                    # GlobalExceptionHandler
│   │   │   │
│   │   │   └── infrastructure/                  # Technical implementations
│   │   │       ├── persistence/repositories/     # 9 Spring Data MongoRepository interfaces
│   │   │       ├── ai/                           # LangChain4jConfig + 6 LLM agents + prompt builders
│   │   │       ├── analysis/                     # Deterministic technology-detection engine
│   │   │       │   └── model/                    # ScannedFile, TechnologyRule, TechnologySignal
│   │   │       ├── report/                       # PDFBox report generator
│   │   │       │   └── model/                    # ModernizationReportData
│   │   │       ├── storage/                      # ZipProjectExtractor, ExtractionResult, ObjectStorage (unused)
│   │   │       ├── security/                     # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal, handlers
│   │   │       ├── logging/                       # AuditLogger (defined, unused)
│   │   │       ├── queue/                         # JobQueue (unused interface)
│   │   │       ├── config/                        # SecurityConfig, OpenApiConfig
│   │   │       └── utils/                         # FileUploadUtils (unused), StringUtils
│   │   │
│   │   └── resources/
│   │       ├── application.yml                   # Base config (all profiles inherit this)
│   │       ├── application-dev.yml                # Local development overrides
│   │       ├── application-docker.yml              # docker-compose overrides
│   │       ├── application-prod.yml               # Production overrides
│   │       └── logback-spring.xml                 # Logging configuration
│   │
│   └── test/java/                                # JUnit 5 / Mockito / Spring Boot Test / embedded Mongo
│
├── temp-uploads/                                 # Local dev extraction target (app.temp-directory), gitignored except structure
├── pom.xml                                       # Maven build (Spring Boot 3.3.0 parent, Java 21)
├── Dockerfile                                    # Multi-stage: maven:3.9-eclipse-temurin-21 → eclipse-temurin:21-jre-alpine
├── ARCHITECTURE.md                               # The backend's own architecture notes (source for much of this doc)
├── .env.example                                  # Environment variable template
└── README.md
```

## 3. Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── app/                                  # Next.js App Router
│   │   ├── page.tsx                           # Public landing page ("/")
│   │   ├── layout.tsx                         # Root HTML shell + Providers
│   │   ├── providers.tsx                      # ThemeProvider + AuthProvider + sonner Toaster
│   │   ├── error.tsx                          # Global error boundary
│   │   ├── not-found.tsx                      # 404 page
│   │   ├── (auth)/                            # Route group — unauthenticated pages
│   │   │   ├── layout.tsx                      # Redirects to /dashboard if already logged in
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/                       # Route group — authenticated app shell
│   │       ├── layout.tsx                      # Header + Sidebar, redirects to /login if not authenticated
│   │       ├── dashboard/page.tsx
│   │       ├── upload/page.tsx
│   │       ├── analysis/page.tsx
│   │       ├── architecture-viewer/page.tsx
│   │       ├── reports/page.tsx
│   │       ├── history/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── settings/page.tsx
│   │       └── projects/[id]/
│   │           ├── page.tsx
│   │           └── executive-summary/page.tsx
│   │
│   ├── components/                           # 14 feature-organized directories, each with a barrel index.ts
│   │   ├── ui/                                 # Generic primitives: button, card, dialog, empty-state,
│   │   │                                        # error-state, illustrations, progress, skeleton, skeleton-patterns
│   │   ├── landing/                             # Public marketing page sections (12 files)
│   │   ├── common/                              # header/, sidebar/, footer/, loader/, theme-toggle/
│   │   ├── dashboard/                           # metric-card, quick-actions, recent-activity-list, stat-card, system-status-card
│   │   ├── upload/                              # dropzone, progress bar, summary card, thumbnail, duplicate dialog
│   │   ├── detection/                           # Technology detection panel + sub-components
│   │   ├── architecture/                        # ArchitectureAnalysisPanel, MermaidDiagram
│   │   ├── analysis/                            # 10 panels/lists for the /analysis page
│   │   ├── planner/                             # ModernizationPlanPanel, level-badge
│   │   ├── reports/                             # cost-estimate-card, report-brand-header, risk-matrix, spring-boot-recommendation-panel
│   │   ├── executive-summary/                   # info-card, score-card, risk-list, recommendation-list
│   │   ├── projects/                            # ProjectCard, ProjectTimeline
│   │   ├── charts/                              # 7 Recharts-based visualizations
│   │   └── architecture-viewer/                 # Empty placeholder barrel — no real components
│   │
│   ├── context/                               # AuthProvider/useAuth, ThemeProvider/useTheme
│   ├── hooks/                                  # useProjectFullAnalysis, useDashboardAnalytics, useInView, etc.
│   ├── services/                               # Axios-based API client functions, grouped by backend feature
│   ├── lib/                                    # Client-side derived logic: executive-summary.ts, report.ts,
│   │                                            # report-pdf.tsx (@react-pdf/renderer), upload-validation.ts, api-client.ts
│   ├── types/                                  # index.ts — all shared TypeScript interfaces/types
│   ├── constants/                              # API_ENDPOINTS, NAVIGATION_ITEMS
│   ├── utils/                                  # cn(), formatters, auth token helpers
│   └── styles/globals.css                      # Tailwind layers + design tokens + custom keyframes
│
├── public/                                    # Static assets (icons/, images/ — currently empty)
├── jest.config.js / jest.setup.js              # Test infra configured; zero test files currently exist
├── next.config.mjs                             # output: 'standalone', /api/* rewrite to localhost:8080
├── tailwind.config.js                          # Design tokens, dark mode via class strategy
├── package.json
└── Dockerfile                                  # Multi-stage: node:20-alpine deps → build → standalone runtime
```

## 4. Documentation (`docs/`)

```
docs/
├── README.md                          # Documentation index (this set)
├── 01-system-architecture.md
├── 02-high-level-design.md
├── 03-low-level-design.md
├── 04-folder-structure.md             # This file
├── 05-module-overview.md
├── 06-backend-architecture.md
├── 07-frontend-architecture.md
├── 08-database-design.md
├── 09-ai-agent-design.md
├── 10-api-documentation.md
├── 11-sequence-diagrams.md
├── 12-deployment-architecture.md
├── 13-security-architecture.md
├── 14-technology-stack.md
├── 15-future-enhancements.md
└── Modernization-architecture.png     # Rendered system architecture diagram
```

---

*Related documents: [05-module-overview.md](./05-module-overview.md)*

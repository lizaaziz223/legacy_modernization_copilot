# Project Structure

Every folder listed below was verified directly against the filesystem (`ls`/`find`) at the time of writing — nothing here is inferred from naming conventions or assumed. Where a commonly-expected folder (e.g. `uploads/`, `reports/`, `prompts/`) does **not** exist in this repository, that is stated explicitly in [A Note on Commonly-Expected Folders](#a-note-on-commonly-expected-folders) below, along with what real location serves that purpose instead.

## Repository Root

```
legacy_modernization_copilot/
├── backend/              # Spring Boot 3.3 REST API (Java 21)
├── frontend/             # Next.js 14 App Router application
├── docs/                 # Project documentation (this file's home)
├── docker-compose.yml    # Local orchestration: mongo + backend + frontend containers
└── package-lock.json     # Empty root-level npm lockfile stub ({ "packages": {} }) — not a real workspace
```

| Folder | Responsibility |
|---|---|
| `backend/` | The entire server-side application: REST API, business logic, AI integration, persistence, security. Independently buildable/deployable (own `pom.xml`, `Dockerfile`). |
| `frontend/` | The entire client-side application: all user-facing pages and UI. Independently buildable/deployable (own `package.json`, `Dockerfile`). |
| `docs/` | All project documentation — architecture, design, API reference, this structure guide. |

Two additional directories exist at the root but are **tooling/VCS internals, not application structure**: `.git/` (version control) and `.claude/` (AI coding-assistant configuration for this repository). They're noted here for completeness but are out of scope for the sections below.

---

## `backend/` — Spring Boot API

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/ailegacy/modernization/copilot/
│   │   │   ├── AiLegacyModernizationCopilotApplication.java   # @SpringBootApplication entry point
│   │   │   │
│   │   │   ├── domain/                    # Framework-independent business model (Clean Architecture core)
│   │   │   │   ├── entities/               # 18 files: Project, User, RefreshToken, TechnologyDetectionResult,
│   │   │   │   │                           #   BusinessAnalysisReport, ArchitectureAnalysisReport,
│   │   │   │   │                           #   SecurityAnalysisReport, PerformanceAnalysisReport,
│   │   │   │   │                           #   ModernizationPlan, GeneratedSpringBootCode, + 8 embedded value objects
│   │   │   │   ├── enums/                  # 8 files: Role, Level, Severity, ArchitecturePattern,
│   │   │   │   │                           #   ModernTechnology, TechnologyType, SecurityIssueType, PerformanceIssueType
│   │   │   │   ├── exceptions/              # 6 files: DomainException + 5 subclasses (ResourceNotFoundException,
│   │   │   │   │                           #   UnauthorizedException, BusinessLogicException, etc.)
│   │   │   │   ├── models/                 # Exists, but empty — no files. Scaffolding for future value objects.
│   │   │   │   ├── repositories/            # 10 files: BaseRepository + 9 repository contracts (interfaces only)
│   │   │   │   └── services/                # 1 file: BaseDomainService — an empty marker interface, unimplemented
│   │   │   │
│   │   │   ├── application/                # Use cases orchestrating domain + infrastructure
│   │   │   │   ├── use_cases/               # 24 use cases, one subfolder per feature:
│   │   │   │   │   ├── auth/                 #   Register, Login, RefreshToken, Logout, GetProfile
│   │   │   │   │   ├── project/               #   Upload, List, Get
│   │   │   │   │   ├── detection/             #   Detect technologies, Get result
│   │   │   │   │   ├── analysis/              #   Business-logic analysis: Analyze, Get
│   │   │   │   │   ├── architecture/          #   Architecture analysis: Analyze, Get
│   │   │   │   │   ├── security/              #   Security analysis: Analyze, Get
│   │   │   │   │   ├── performance/           #   Performance analysis: Analyze, Get
│   │   │   │   │   ├── planner/               #   Modernization plan: Generate, Get
│   │   │   │   │   ├── generator/             #   Spring Boot code sample: Generate, Get
│   │   │   │   │   └── report/                #   Assemble the downloadable PDF report
│   │   │   │   ├── orchestrators/            # 1 file: Orchestrator — an empty marker interface, unimplemented
│   │   │   │   ├── services/                 # BaseApplicationService (marker) + AuthTokenService (real: issues JWTs)
│   │   │   │   ├── dto/                      # Exists, but empty — no files. All real DTOs live under interfaces/rest/dto/
│   │   │   │   └── mappers/                  # BaseMapper (marker) + 9 hand-written entity→DTO mapper classes
│   │   │   │
│   │   │   ├── interfaces/rest/             # HTTP boundary — the only way into the application
│   │   │   │   ├── controllers/              # 11 @RestController classes (Auth, Project, TechnologyDetection,
│   │   │   │   │                            #   BusinessAnalysis, ArchitectureAnalysis, SecurityAnalysis,
│   │   │   │   │                            #   PerformanceAnalysis, ModernizationPlan, SpringBootGenerator,
│   │   │   │   │                            #   ModernizationReport, Health)
│   │   │   │   ├── dto/                      # Request/response DTOs, one subfolder per feature area
│   │   │   │   └── exception/                # GlobalExceptionHandler (@RestControllerAdvice)
│   │   │   │
│   │   │   └── infrastructure/              # Technical implementations of domain contracts
│   │   │       ├── ai/                       # LangChain4jConfig + 6 LLM-driven agents + their prompt builders
│   │   │       │   └── model/                 #   Llm*Payload structured-output DTOs
│   │   │       ├── analysis/                 # Deterministic (non-AI) technology detection engine:
│   │   │       │   │                          #   rule catalog, confidence scorer, 13 attribute detectors
│   │   │       │   └── model/                 #   ScannedFile, TechnologyRule, TechnologySignal
│   │   │       ├── config/                   # SecurityConfig, OpenApiConfig
│   │   │       ├── logging/                  # AuditLogger (defined, not currently called anywhere)
│   │   │       ├── persistence/repositories/ # 9 Spring Data MongoRepository interfaces
│   │   │       ├── queue/                    # JobQueue — an interface, unimplemented (no async job queue exists)
│   │   │       ├── report/                   # PDFBox-based report generator (ModernizationReportPdfGenerator, PdfReportWriter)
│   │   │       │   └── model/                 #   ModernizationReportData aggregate record
│   │   │       ├── security/                 # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal, auth handlers
│   │   │       ├── storage/                  # ZipProjectExtractor (real) + ObjectStorage (interface, unimplemented)
│   │   │       └── utils/                    # FileUploadUtils, StringUtils
│   │   │
│   │   └── resources/
│   │       ├── application.yml               # Base configuration (all profiles inherit this)
│   │       ├── application-dev.yml            # Local development overrides (default active profile)
│   │       ├── application-docker.yml         # docker-compose overrides
│   │       ├── application-prod.yml           # Production overrides
│   │       └── logback-spring.xml             # Logging configuration
│   │
│   └── test/
│       ├── java/com/ailegacy/modernization/copilot/   # 21 real JUnit test files covering:
│       │                                               #   use cases (Login, Register, UploadProject),
│       │                                               #   domain enums (6 test classes),
│       │                                               #   AI agents (Architecture/BusinessLogic/Modernization/
│       │                                               #     Performance/Security analyzers, Spring Boot generator,
│       │                                               #     CodeDigestBuilder, + a FakeChatLanguageModel test double),
│       │                                               #   the deterministic analysis engine (ConfidenceScorer,
│       │                                               #     TechnologyDetectionEngine),
│       │                                               #   security (JwtTokenProvider), storage (ZipProjectExtractor),
│       │                                               #   and one REST controller (HealthController)
│       └── resources/                                 # Exists, currently empty
│
├── temp-uploads/                             # Runtime data — NOT source code. Where uploaded project ZIPs are
│   └── projects/                             #   extracted (app.temp-directory, dev profile: ./temp-uploads).
│       └── <project-uuid>/...                #   Currently holds 7 real extracted legacy codebases from prior
│                                              #   local testing/development (e.g. hospital-management-system,
│                                              #   banking-management-system, insurance-claim-processing-system).
│                                              #   Gitignored (/temp-uploads/); this is the closest real analog to
│                                              #   "uploads/" or "sample-projects/" in this repository.
│
├── target/                                   # Maven build output (compiled classes, packaged jar). Generated,
│                                              #   gitignored (target/). Not source.
│
├── pom.xml                                   # Maven build definition (Spring Boot 3.3.0 parent, Java 21)
├── Dockerfile                                # Multi-stage image build (maven:3.9-eclipse-temurin-21 → eclipse-temurin:21-jre-alpine)
├── ARCHITECTURE.md                           # The backend's own architecture notes
├── README.md
├── .env.example                              # Environment variable template (placeholders only)
├── .gitignore
└── .dockerignore
```

---

## `frontend/` — Next.js Application

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router — every page and layout in the application
│   │   ├── page.tsx                    #   Public landing page ("/")
│   │   ├── layout.tsx                  #   Root HTML shell
│   │   ├── providers.tsx               #   ThemeProvider + AuthProvider + sonner Toaster
│   │   ├── error.tsx / not-found.tsx   #   Global error boundary / 404
│   │   ├── (auth)/                     #   Route group: login, register
│   │   └── (dashboard)/                #   Route group: dashboard, upload, analysis, architecture-viewer,
│   │                                    #     reports, history, profile, settings, projects/[id] (+ executive-summary)
│   │
│   ├── components/                   # 14 feature-organized directories, each with a barrel index.ts:
│   │   ├── ui/                          #   Generic design-system primitives (Button, Card, Dialog, EmptyState,
│   │   │                                #     ErrorState, Skeleton, Progress, illustrations)
│   │   ├── landing/                     #   Public marketing-page sections
│   │   ├── common/                      #   App chrome: header, sidebar, footer, theme-toggle
│   │   ├── dashboard/                   #   Executive dashboard widgets
│   │   ├── upload/                      #   Upload flow (dropzone, progress bar, summary card)
│   │   ├── detection/                   #   Technology detection display
│   │   ├── architecture/                #   Architecture panel + Mermaid diagram renderer
│   │   ├── analysis/                    #   Full per-project analysis view panels/lists
│   │   ├── planner/                     #   Modernization plan display
│   │   ├── reports/                     #   Modernization report page sections
│   │   ├── executive-summary/           #   Executive summary page building blocks
│   │   ├── projects/                    #   Project card + timeline
│   │   ├── charts/                      #   Recharts-based dashboard visualizations
│   │   └── architecture-viewer/         #   Empty placeholder barrel — no real components (the /architecture-viewer
│   │                                    #     page actually imports from components/architecture/ instead)
│   │
│   ├── context/                       # React Context: AuthProvider/useAuth, ThemeProvider/useTheme
│   ├── hooks/                          # Custom hooks (useProjectFullAnalysis, useDashboardAnalytics, etc.)
│   ├── lib/                            # Client-side derived logic: PDF generation, executive-summary/report
│   │                                    #   heuristics, upload validation, the Axios client instance
│   ├── services/                       # Typed API-call functions, one object per backend feature
│   ├── types/                          # Shared TypeScript interfaces/types (index.ts)
│   ├── constants/                      # API_ENDPOINTS, NAVIGATION_ITEMS
│   ├── utils/                          # cn(), formatters, auth-token helpers
│   └── styles/                         # globals.css — Tailwind layers, design tokens, custom keyframes
│
├── public/                           # Static assets
│   ├── icons/                          #   Exists, currently empty
│   └── images/                         #   Exists, currently empty
│
├── tests/                            # Exists, currently empty. jest.config.js includes it in `roots`,
│                                      #   so this is where future non-src tests are expected to live —
│                                      #   no test files exist anywhere in the frontend today.
│
├── .next/                            # Next.js build output. Generated, not source.
├── node_modules/                     # npm dependency cache. Generated, not source.
│
├── package.json / package-lock.json
├── tsconfig.json
├── next.config.mjs                   # output: 'standalone'; dev-only /api/* rewrite to localhost:8080
├── tailwind.config.js
├── jest.config.js / jest.setup.js    # Test infrastructure configured; zero test files currently exist
├── .eslintrc.js / .prettierrc
├── Dockerfile                        # Multi-stage image build (node:20-alpine deps → build → standalone runtime)
├── ARCHITECTURE.md
├── README.md
├── .env.example                      # Placeholder-only
└── .env.local                        # Local developer overrides (gitignored)
```

---

## `docs/` — Documentation

```
docs/
├── README.md                          # Documentation index
├── project-structure.md               # This file
├── 01-system-architecture.md
├── 02-high-level-design.md
├── 03-low-level-design.md
├── 04-folder-structure.md
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
├── Modernization-architecture.png     # Rendered system architecture diagram
├── CLAUDE_MASTER_PROMPT.md            # Project-specific notes (pre-existing, not part of this documentation set)
├── PROJECT_RULES.md                   # Project-specific notes (pre-existing, not part of this documentation set)
├── hackathon_b19_preread.docx         # Hackathon reference material (pre-existing)
└── Hackathon_Solutions-B19.pdf        # Hackathon reference material (pre-existing)
```

---

## A Note on Commonly-Expected Folders

The prompt for this document used `uploads/`, `reports/`, `prompts/`, and `sample-projects/` as illustrative examples of "important folders" a project like this might have. **None of these exist as top-level (or `backend/`/`frontend/`-level) directories in this repository.** Rather than inventing them, here is what actually serves each purpose:

| Example name | Exists as-named? | What actually does this job |
|---|---|---|
| `uploads/` | No | `backend/temp-uploads/projects/<uuid>/` — where `ZipProjectExtractor` extracts an uploaded ZIP. Runtime data, gitignored. |
| `sample-projects/` | No | The same `backend/temp-uploads/projects/` directory currently holds 7 real extracted codebases from local testing — there is no separate, curated "sample projects" folder shipped with the repo. |
| `reports/` | No | Reports are generated **on the fly**, in memory, and streamed directly in the HTTP response (`GET /projects/{id}/modernization-report`) or built client-side in the browser (`src/lib/report-pdf.tsx`). Nothing is written to disk under a `reports/` folder. The relevant *code* lives in `backend/src/main/java/.../infrastructure/report/`. |
| `prompts/` | No | LLM prompts are **inline Java text blocks** inside each `infrastructure/ai/*PromptBuilder.java` class — there are no external `.txt`/`.md` prompt template files or a dedicated prompts folder. |

---

*Related: [04-folder-structure.md](./04-folder-structure.md) covers the same ground with additional architectural framing; this document is the focused, standalone folder-by-folder reference.*

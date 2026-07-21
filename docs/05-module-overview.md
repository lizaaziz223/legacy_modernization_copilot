# Module Overview

A module-by-module summary of what each major part of the system is responsible for. See [04-folder-structure.md](./04-folder-structure.md) for exact paths.

## Backend Modules

| Module | Responsibility | Key classes |
|---|---|---|
| **Auth** | Registration, login, JWT issuance, stateless-token validation, refresh-token rotation/revocation, logout | `AuthController`, `RegisterUseCase`, `LoginUseCase`, `RefreshTokenUseCase`, `LogoutUseCase`, `GetProfileUseCase`, `AuthTokenService`, `JwtTokenProvider`, `JwtAuthenticationFilter` |
| **Project** | ZIP upload, extraction, project metadata, project listing | `ProjectController`, `UploadProjectUseCase`, `ListProjectsUseCase`, `GetProjectUseCase`, `ZipProjectExtractor` |
| **Technology Detection** | Deterministic identification of Java/JDK version, build tool, frameworks, app server, databases, packaging style, with per-attribute confidence scores and evidence | `TechnologyDetectionController`, `DetectTechnologiesUseCase`, `TechnologyDetectionEngine`, `TechnologyRuleCatalog`, `ConfidenceScorer`, 13 attribute detectors |
| **Business Analysis** | AI-generated explanation of what the legacy system does — purpose, modules, workflows, entities | `BusinessAnalysisController`, `AnalyzeBusinessLogicUseCase`, `BusinessLogicAnalyzer` |
| **Architecture Analysis** | AI-generated architecture pattern classification, score, Mermaid diagrams (current + target), recommendations | `ArchitectureAnalysisController`, `AnalyzeArchitectureUseCase`, `ArchitectureAnalyzer` |
| **Security Analysis** | AI-generated vulnerability findings (SQL injection, hardcoded passwords, weak encryption, missing auth, session risk, OWASP issues) with severity and risk score | `SecurityAnalysisController`, `AnalyzeSecurityUseCase`, `SecurityAnalyzer` |
| **Performance Analysis** | AI-generated performance/code-quality findings (N+1 queries, god objects, memory-leak risk, duplicate code, blocking I/O) with a performance score | `PerformanceAnalysisController`, `AnalyzePerformanceUseCase`, `PerformanceAnalyzer` |
| **Modernization Planner** | AI-generated migration strategy, timeline, complexity, priority matrix, quick wins, risks, and required target technologies — optionally synthesizing every prior analysis stage | `ModernizationPlanController`, `GenerateModernizationPlanUseCase`, `ModernizationPlanner` |
| **Spring Boot Generator** | AI-generated sample conversion: one legacy Servlet → REST controller, one JDBC DAO → Spring Data JPA repository/entity/service | `SpringBootGeneratorController`, `GenerateSpringBootCodeUseCase`, `SpringBootGenerator` |
| **Modernization Report** | Assembles whichever analyses exist into a single downloadable PDF — no new AI generation | `ModernizationReportController`, `GenerateModernizationReportUseCase`, `ModernizationReportPdfGenerator`, `PdfReportWriter` |
| **Security Infrastructure** | JWT signing/validation, Spring Security filter chain, CORS, password hashing, standardized auth error responses | `SecurityConfig`, `JwtAuthenticationFilter`, `JwtTokenProvider`, `UserPrincipal`, `RestAuthenticationEntryPoint`, `RestAccessDeniedHandler` |
| **Error Handling** | Converts every domain/validation exception into a consistent `ApiResponse` JSON error shape | `GlobalExceptionHandler` |
| **API Documentation** | OpenAPI/Swagger UI generation with a global bearer-JWT security scheme | `OpenApiConfig`, springdoc-openapi |

## Frontend Modules

| Module | Responsibility | Key files |
|---|---|---|
| **Public Landing** | Marketing page: hero, features, how-it-works, tech stack, legacy tech, why-modernize, CTA | `src/app/page.tsx`, `src/components/landing/*` |
| **Auth** | Login/registration forms, session state, redirect gating | `src/app/(auth)/*`, `src/context/auth-context.tsx` |
| **Dashboard Shell** | Header, sidebar, mobile nav, authenticated-route gating | `src/app/(dashboard)/layout.tsx`, `src/components/common/*` |
| **Executive Dashboard** | Aggregate metrics/charts across all of a user's projects | `src/app/(dashboard)/dashboard/page.tsx`, `src/hooks/use-dashboard-analytics.ts`, `src/components/charts/*` |
| **Upload Flow** | Drag-and-drop ZIP upload, client-side validation, progress tracking, duplicate detection, post-upload technology detection kickoff | `src/app/(dashboard)/upload/page.tsx`, `src/components/upload/*`, `src/lib/upload-validation.ts` |
| **Project Detail** | Single-project hub: run/re-run technology detection, architecture analysis, modernization plan; scorecard, timeline | `src/app/(dashboard)/projects/[id]/page.tsx` |
| **Analysis View** | Consolidated, collapsible view of every analysis stage for one project | `src/app/(dashboard)/analysis/page.tsx`, `src/components/analysis/*` |
| **Architecture Viewer** | Focused viewer for current/target architecture Mermaid diagrams | `src/app/(dashboard)/architecture-viewer/page.tsx`, `src/components/architecture/*` |
| **Reports** | 12-section on-screen modernization report + client-side branded PDF export | `src/app/(dashboard)/reports/page.tsx`, `src/components/reports/*`, `src/lib/report-pdf.tsx` |
| **Executive Summary** | Printable, single-page summary for one project | `src/app/(dashboard)/projects/[id]/executive-summary/page.tsx` |
| **History** | Grid of all previously uploaded projects | `src/app/(dashboard)/history/page.tsx` |
| **Design System** | Shared UI primitives (Button, Card, Dialog, EmptyState, ErrorState, Skeleton, Progress, illustrations) | `src/components/ui/*` |
| **API Client Layer** | Typed Axios wrappers per backend feature, JWT attach/refresh handling | `src/services/index.ts`, `src/lib/api-client.ts` |

## Cross-Cutting Modules

| Module | Backend | Frontend |
|---|---|---|
| **Theming** | n/a | `src/context/theme-context.tsx` — light/dark via `localStorage` + Tailwind `class` strategy |
| **Notifications** | n/a | `sonner` toasts, wired at every mutation call site |
| **Config** | 4 Spring profiles (`dev`/`docker`/`prod`/base) | `NEXT_PUBLIC_API_BASE_URL` env var, `next.config.mjs` rewrites |
| **Observability** | Spring Actuator (`health`, `info`, `metrics`, `prometheus`), SLF4J/Logback | Browser console only — no client-side telemetry/error-tracking SDK found |

---

*Related documents: [06-backend-architecture.md](./06-backend-architecture.md) · [07-frontend-architecture.md](./07-frontend-architecture.md)*

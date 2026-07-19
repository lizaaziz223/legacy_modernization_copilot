# Sequence Diagrams

Flow-by-flow detail for the system's core operations, derived from the actual controller/use-case/repository call chains.

## 1. Registration & Login

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant AC as AuthController
    participant RU as RegisterUseCase
    participant UR as UserRepository
    participant ATS as AuthTokenService
    participant JWT as JwtTokenProvider
    participant RTR as RefreshTokenRepository

    FE->>AC: POST /auth/register {name, email, password, role}
    AC->>RU: execute(RegisterRequest)
    RU->>UR: existsByEmail(email)
    alt email already registered
        RU-->>AC: throw BusinessLogicException("EMAIL_ALREADY_EXISTS")
        AC-->>FE: 422 ApiResponse.error
    else new email
        RU->>UR: save(new User(passwordHash=BCrypt(...), enabled=true))
        RU->>ATS: issueTokens(user)
        ATS->>JWT: generateAccessToken(user) / generateRefreshToken(user)
        ATS->>RTR: save(RefreshToken{tokenHash=SHA256(jti), expiresAt, revoked=false})
        ATS-->>RU: AuthTokenResponse
        RU-->>AC: AuthTokenResponse
        AC-->>FE: 201 ApiResponse.success(AuthTokenResponse)
    end
```

## 2. Token Refresh (Rotation)

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant AC as AuthController
    participant RTU as RefreshTokenUseCase
    participant JWT as JwtTokenProvider
    participant RTR as RefreshTokenRepository
    participant UR as UserRepository
    participant ATS as AuthTokenService

    FE->>AC: POST /auth/refresh {refreshToken}
    AC->>RTU: execute(RefreshTokenRequest)
    RTU->>JWT: validateToken(token) && type == "refresh"
    RTU->>RTR: findByTokenHash(hash(jti))
    alt not found, revoked, or expired
        RTU-->>AC: throw UnauthorizedException
        AC-->>FE: 401 ApiResponse.error
    else valid
        RTU->>UR: findById(userId)
        RTU->>RTR: save(existingToken.revoked = true)  note: single-use rotation
        RTU->>ATS: issueTokens(user)
        ATS-->>RTU: AuthTokenResponse (new access + new refresh)
        RTU-->>AC: AuthTokenResponse
        AC-->>FE: 200 ApiResponse.success(AuthTokenResponse)
    end
```

## 3. Every Authenticated Request

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant Filter as JwtAuthenticationFilter
    participant SC as SecurityContextHolder
    participant Ctrl as Controller

    FE->>Filter: HTTP request, Authorization: Bearer <accessToken>
    Filter->>Filter: extract token after "Bearer "
    Filter->>Filter: validateToken(token) && type == "access"
    alt invalid or wrong type
        Filter->>Filter: log error, continue chain unauthenticated
        Note over Filter: no hard rejection here
    else valid
        Filter->>Filter: read userId/role/email claims (no DB lookup)
        Filter->>SC: set UsernamePasswordAuthenticationToken(UserPrincipal, authorities=[ROLE_x])
    end
    Filter->>Ctrl: continue filter chain
    alt endpoint requires auth and none was set
        Ctrl-->>FE: 401 (via RestAuthenticationEntryPoint)
    else authenticated
        Ctrl-->>FE: normal response
    end
```

## 4. Project Upload

```mermaid
sequenceDiagram
    participant FE as Frontend (Upload page)
    participant PC as ProjectController
    participant UPU as UploadProjectUseCase
    participant ZPE as ZipProjectExtractor
    participant PR as ProjectRepository
    participant TDC as TechnologyDetectionController

    FE->>PC: POST /projects (multipart file)
    PC->>UPU: execute(UploadProjectCommand)
    UPU->>ZPE: extract(file, newProjectId)
    ZPE->>ZPE: guard against zip-slip, keep only supported extensions,<br/>and enforce max-extracted-size-mb
    ZPE-->>UPU: ExtractionResult(storagePath, totalFiles, totalFolders, totalSizeBytes, breakdown)
    UPU->>PR: save(new Project)
    UPU-->>PC: ProjectSummaryResponse
    PC-->>FE: 201 ApiResponse.success(ProjectSummaryResponse)
    Note over FE: frontend immediately fires a background<br/>technology-detection call
    FE->>TDC: POST /projects/{id}/technology-detection
    TDC-->>FE: 201 TechnologyDetectionResponse (or toast.error on failure)
```

## 5. AI-Backed Analysis (representative of all six agents)

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant Ctrl as *AnalysisController
    participant UC as Analyze*UseCase
    participant PR as ProjectRepository
    participant PriorRepo as Prior-stage repositories (optional)
    participant Agent as *Analyzer (AI agent)
    participant Digest as CodeDigestBuilder
    participant LLM as ChatLanguageModel
    participant ReportRepo as *ReportRepository

    FE->>Ctrl: POST /projects/{id}/{stage}-analysis
    Ctrl->>UC: execute(GetProjectCommand)
    UC->>PR: findByIdAndOwnerId(id, ownerId)
    alt project not found
        UC-->>Ctrl: throw ResourceNotFoundException (404)
    end
    opt optional context enrichment
        UC->>PriorRepo: findByProjectId(id)  note: technology/business results, if present
    end
    UC->>Agent: analyze(id, name, storagePath, knownTechnologies?)
    Agent->>Digest: build(storagePath)  note: rank + truncate files to max-digest-chars
    Digest-->>Agent: CodeDigest
    Agent->>Agent: build prompt (PromptBuilder, inline text block)
    Agent->>LLM: generate(prompt)
    alt no API key configured
        Agent-->>UC: throw BusinessLogicException("AI_DISABLED") (422)
    else
        LLM-->>Agent: raw text response
        Agent->>Agent: regex-extract {...} JSON, Jackson-parse to Llm*Payload
        Agent->>Agent: map payload → domain entity
        Agent-->>UC: e.g. SecurityAnalysisReport
        UC->>ReportRepo: deleteByProjectId(id)
        UC->>ReportRepo: save(entity)
        UC->>UC: mapper.toResponse(entity)
        UC-->>Ctrl: *Response DTO
        Ctrl-->>FE: 201 ApiResponse.success(*Response)
    end
```

## 6. Modernization Plan (Multi-Source Context)

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant Ctrl as ModernizationPlanController
    participant UC as GenerateModernizationPlanUseCase
    participant Repos as 5 optional *ReportRepositories
    participant Planner as ModernizationPlanner
    participant LLM as ChatLanguageModel
    participant PlanRepo as ModernizationPlanRepository

    FE->>Ctrl: POST /projects/{id}/modernization-plan
    Ctrl->>UC: execute(GetProjectCommand)
    UC->>Repos: findByProjectId(id) x5 (technology, business, architecture, security, performance)
    Repos-->>UC: whichever exist (others null)
    UC->>UC: build ModernizationContext<br/>(security/performance findings capped to top 3 each)
    UC->>Planner: plan(id, name, storagePath, context)
    Planner->>LLM: generate(prompt with full context)
    LLM-->>Planner: strategy, timeline, complexity, priorityMatrix, quickWins, risks, requiredTechnologies
    Planner-->>UC: ModernizationPlan
    UC->>PlanRepo: deleteByProjectId(id), then save(plan)
    UC-->>Ctrl: ModernizationPlanResponse
    Ctrl-->>FE: 201 ApiResponse.success(ModernizationPlanResponse)
```

## 7. Modernization Report (PDF, No AI Call)

```mermaid
sequenceDiagram
    participant FE as Frontend (Reports page)
    participant Ctrl as ModernizationReportController
    participant UC as GenerateModernizationReportUseCase
    participant Repos as All 7 *ReportRepositories
    participant Gen as ModernizationReportPdfGenerator
    participant Writer as PdfReportWriter

    FE->>Ctrl: GET /projects/{id}/modernization-report
    Ctrl->>UC: execute(GetProjectCommand)
    UC->>Repos: findByProjectId(id) x7 (technology, business, architecture, security, performance, plan, generated-code)
    Repos-->>UC: whichever exist (others null → rendered as "Not yet analyzed" placeholders)
    UC->>Gen: generate(ModernizationReportData)
    Gen->>Writer: write 8 sections (cover, exec summary, tech stack,<br/>architecture, security, performance, roadmap, Spring Boot sample, cloud recommendation)
    Writer-->>Gen: byte[] PDF
    Gen-->>UC: byte[]
    UC-->>Ctrl: GeneratedReportFile(bytes, filename)
    Ctrl-->>FE: 200 application/pdf (Content-Disposition: attachment)
```

Note: the frontend Reports page **also** has an independent, client-side PDF generation path (`src/lib/report-pdf.tsx`, using `@react-pdf/renderer`) that builds a differently-styled, branded PDF directly in the browser from already-fetched JSON data, without calling this backend endpoint. Both PDF paths exist in the codebase; the project-detail page's "Download PDF Report" button calls the backend endpoint above, while the Reports page's "Download Professional PDF" button uses the client-side path.

---

*Related documents: [09-ai-agent-design.md](./09-ai-agent-design.md) · [10-api-documentation.md](./10-api-documentation.md)*

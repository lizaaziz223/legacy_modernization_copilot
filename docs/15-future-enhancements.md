# Future Enhancements

Every item below is grounded in a specific, verified observation from the current codebase — either scaffolding that already exists but isn't wired up, or a gap identified while auditing the actual implementation. None of this is speculative feature brainstorming disconnected from the code.

## 1. Complete the Scaffolding That Already Exists

The codebase contains several interfaces clearly intended to be implemented, with Javadoc describing the intent, but with zero implementations today:

| Interface | Location | What completing it would enable |
|---|---|---|
| `ObjectStorage` | `infrastructure/storage/` | Swap local-disk project storage for S3/Azure Blob/GCS — needed for any horizontally-scaled or multi-instance deployment, since `ZipProjectExtractor` currently writes to local disk only |
| `JobQueue` | `infrastructure/queue/` | Move the six synchronous AI analysis calls off the request thread — today a slow LLM response directly extends client-perceived HTTP latency, with no configured timeout as a backstop |
| `BaseDomainService` / a real domain-service layer | `domain/services/` | Extract business rules currently embedded directly in use cases and AI-agent classes into testable, framework-independent domain services, as the Clean Architecture intent in `backend/ARCHITECTURE.md` describes |
| `Orchestrator` | `application/orchestrators/` | Introduce real multi-use-case workflow coordination (e.g. "run technology detection, then architecture analysis, then the plan" as one triggered pipeline) instead of requiring the frontend to sequence separate calls |
| `AuditLogger` | `infrastructure/logging/` | Wire up the already-written `logScanStarted`/`logUserAction`/etc. methods, currently defined but never called |
| MapStruct adoption | `application/mappers/` | Replace the 9 hand-written mappers with generated ones — the dependency is already in `pom.xml` |

## 2. Authorization

The `Role` enum (`ADMIN`/`ARCHITECT`/`DEVELOPER`) and its JWT/`UserPrincipal` plumbing exist end-to-end, but — verified by a repo-wide search — **no endpoint anywhere restricts access by role**. A natural next step: decide which operations should actually be role-gated (e.g. should `DEVELOPER` be read-only on some resource, should only `ARCHITECT`/`ADMIN` trigger the AI-cost-incurring analyses?) and add `@PreAuthorize` accordingly — `@EnableMethodSecurity` is already enabled in `SecurityConfig`, so this is additive, not a rearchitecture.

## 3. Analysis History

Every analysis use case deletes the prior document before saving a new one (`deleteByProjectId` then `save`). There is currently no way to see how a project's security score, for instance, changed between two analysis runs. Introducing an append-only history collection (or a `version`/`supersededAt` field) alongside the existing "current result" collections would enable trend charts without disrupting the existing "fetch current result" API shape.

## 4. Asynchronous, Progress-Reporting Analysis

Because every AI-backed endpoint blocks until the LLM responds, and no request timeout is configured, a slow provider directly stalls the UI. Combining the unused `JobQueue` interface with a polling or WebSocket-based status endpoint (`PENDING` → `RUNNING` → `COMPLETE`/`FAILED`) would let the frontend show real progress instead of an indefinite spinner, and would let the backend enforce a hard timeout without failing the whole HTTP request.

## 5. Full-Project Spring Boot Migration

`SpringBootGenerator` is explicitly scoped, by its own code, to converting **one** representative Servlet and **one** representative JDBC class per project — a demonstration of the target pattern, not a full migration. Extending this to iterate every detected Servlet/JDBC class (bounded by the same digest-size constraints already in place via `CodeDigestBuilder`) is the natural next step toward the product's stated goal of full legacy-to-Spring-Boot modernization.

## 6. Testing

- **Frontend**: `jest`, `jest-environment-jsdom`, and `@testing-library/react`/`jest-dom` are fully configured (`jest.config.js`, `jest.setup.js`), but zero test files exist under `src/`. The highest-value first targets, given the codebase, are the pure functions already isolated for exactly this purpose: `src/lib/executive-summary.ts`, `src/lib/report.ts`, and `src/lib/upload-validation.ts`.
- **Backend**: test dependencies (`spring-boot-starter-test`, `spring-security-test`, embedded MongoDB) are declared in `pom.xml`; a coverage pass over the 24 use cases (especially the auth flows and the replace-on-rerun pattern) and the deterministic `infrastructure/analysis` detectors (easy to unit test — pure functions over file content) would materially reduce regression risk.

## 7. CI/CD

No `.github/workflows` directory exists in this repository. A minimal pipeline — `mvn test` + `mvn package` for the backend, `npm run type-check && npm run lint && npm run build` for the frontend, on every PR — would catch regressions before merge; both commands are already defined and working (`package.json` scripts, Maven lifecycle).

## 8. Production-Hardening Items

Each of these was identified as a concrete gap while auditing the current implementation (see [13-security-architecture.md](./13-security-architecture.md) and [12-deployment-architecture.md](./12-deployment-architecture.md) for detail):

- Make CORS allowed-origins environment-configurable instead of hardcoded Java literals in `SecurityConfig`.
- Configure an explicit request timeout on the LangChain4j `ChatLanguageModel` builder.
- Restrict or authenticate Swagger UI / OpenAPI JSON in the `prod` profile.
- Decide whether Azure OpenAI support (currently a dead dependency + unused config block) should be finished or removed.
- Ensure `JWT_SECRET` has no insecure default in any profile that could plausibly run in production (currently only `prod` correctly omits a default).
- Rotate the credentials found committed in `backend/.env.example` during this documentation effort, and audit git history / other config files for similar exposure.

## 9. Pagination

`GET /projects` returns the caller's entire project list in one response, sorted newest-first, with no `page`/`size` parameters. This is fine at small scale but will need pagination as usage grows — the repository method (`findByOwnerIdOrderByCreatedAtDesc`) would need a `Pageable` variant.

---

*Related documents: [01-system-architecture.md](./01-system-architecture.md) · [06-backend-architecture.md](./06-backend-architecture.md) · [13-security-architecture.md](./13-security-architecture.md)*

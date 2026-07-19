# Deployment Architecture

## 1. Local / Reference Deployment: `docker-compose.yml`

This is the only deployment topology actually defined as code in this repository.

```mermaid
graph TB
    subgraph Host["Docker Host"]
        subgraph Compose["docker-compose.yml"]
            Mongo["mongo:7<br/>container: ai-legacy-copilot-mongo<br/>port 27017 → 27017<br/>volume: mongo-data:/data/db"]
            Backend["backend (built from ./backend)<br/>container: ai-legacy-copilot-backend<br/>port 8080 → 8080<br/>SPRING_PROFILES_ACTIVE=docker"]
            Frontend["frontend (built from ./frontend)<br/>container: ai-legacy-copilot-frontend<br/>port 3000 → 3000"]
        end
    end

    Frontend -- "depends_on" --> Backend
    Backend -- "depends_on" --> Mongo
    Backend -- "MONGODB_HOST=mongo, MONGODB_PORT=27017" --> Mongo
    Frontend -- "NEXT_PUBLIC_API_BASE_URL" --> Backend
```

Environment variables consumed by the `backend` service (with defaults from `docker-compose.yml`):

| Variable | Default | Purpose |
|---|---|---|
| `MONGODB_DATABASE` | `ai_legacy_modernization` | Database name |
| `JWT_SECRET` | *(insecure placeholder — override in real use)* | JWT signing key |
| `APP_ADMIN_PASSWORD` | `admin123` | Spring Security basic-auth admin password (unrelated to the app's own JWT users) |
| `OPENAI_API_KEY` | *(empty)* | Enables the six AI agents when set |

Environment variables consumed by the `frontend` service:

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api` |

## 2. Container Build Pipelines

### Backend (`backend/Dockerfile`)

```mermaid
graph LR
    S1["Stage: build<br/>maven:3.9-eclipse-temurin-21<br/>mvn dependency:go-offline → mvn clean package -DskipTests"] --> S2["Stage: runtime<br/>eclipse-temurin:21-jre-alpine<br/>non-root user spring:spring<br/>COPY target/*.jar app.jar<br/>EXPOSE 8080<br/>ENTRYPOINT java -jar app.jar"]
```

### Frontend (`frontend/Dockerfile`)

```mermaid
graph LR
    F1["Stage: deps<br/>node:20-alpine<br/>npm ci"] --> F2["Stage: build<br/>npm run build<br/>(next.config.mjs: output: 'standalone')"] --> F3["Stage: runtime<br/>node:20-alpine<br/>non-root user nextjs:nextjs<br/>COPY .next/standalone + .next/static + public<br/>EXPOSE 3000<br/>CMD node server.js"]
```

Both images run as a **non-root user** and use **multi-stage builds** to keep the final image free of build tooling.

## 3. Spring Profiles

Four profiles select different infrastructure targets for the same application code:

```mermaid
graph TB
    Base["application.yml (base)<br/>port 8080, context-path /api<br/>jwt.expiration-ms=900000, refresh=604800000"]
    Dev["dev (default)<br/>temp-directory=./temp-uploads<br/>output-directory=./output-reports<br/>verbose logging (DEBUG)<br/>Mongo Atlas SRV URI"]
    Docker["docker<br/>used by docker-compose.yml<br/>temp-directory=/tmp/ai-legacy-copilot<br/>plain Mongo host:port connection to the 'mongo' service"]
    Prod["prod<br/>temp-directory=/var/ai-legacy-copilot/temp<br/>auto-index-creation=false<br/>quieter logging (WARN/INFO)<br/>JWT_SECRET has NO default — must be supplied<br/>Mongo Atlas SRV URI"]

    Base --> Dev
    Base --> Docker
    Base --> Prod
```

`backend/ARCHITECTURE.md` documents only `dev`/`prod`; the `docker` profile is real (used by the compose file) but undocumented there.

## 4. Known Production Deployment Target

> The information in this section is **not** derived from configuration files in this repository — no Northflank-specific manifest, Procfile, or platform config exists in-repo at the time of writing. It is included because it reflects this project's actual operating history and is directly relevant to anyone maintaining it.

This application has, in practice, been deployed to **Northflank**, using the same generic Docker images described above (Northflank builds and runs arbitrary Dockerfiles/containers, so no additional in-repo configuration was required). Two points worth knowing if you deploy there:

- **Backend startup ordering**: Tomcat's real bind is deferred until after all Spring beans construct. A `MongoClient` bean's synchronous SRV DNS lookup, or an eagerly-constructed bean that depends on a `ChatLanguageModel`, can therefore delay or hang the perceived "startup" on some networks — worth watching for in health-check timeouts.
- **Frontend runtime footprint**: on a memory-constrained host, running `next start` (or `next dev`) directly is heavier than using the `output: 'standalone'` build (`node .next/standalone/server.js`), which is what the frontend `Dockerfile` already does.

## 5. Observability

| Endpoint | Purpose |
|---|---|
| `GET /api/health` (custom) | Simple `{status, service, version, environment, timestamp}` — public |
| `GET /api/actuator/health` | Spring Boot Actuator health |
| `GET /api/actuator/info` | Build/app info |
| `GET /api/actuator/metrics` | Micrometer metrics |
| `GET /api/actuator/prometheus` | Prometheus scrape endpoint (`management.metrics.export.prometheus.enabled: true`) |

No log-aggregation or APM integration (e.g. ELK, Datadog) was found configured in the codebase — logging is SLF4J/Logback to console and/or a rolling file (`logging.file.name`, set per profile), per `logback-spring.xml`.

## 6. What's Missing for a Full Production Pipeline

Documented here as fact-based gaps (see [15-future-enhancements.md](./15-future-enhancements.md) for the fuller list):

- No CI/CD — no `.github/workflows` directory exists.
- No infrastructure-as-code (Terraform/Pulumi/CloudFormation) in-repo.
- No secrets manager integration — secrets are plain environment variables.
- CORS origins are hardcoded Java literals (`http://localhost:3000/:5173/:9090`) in `SecurityConfig`, not environment-driven — this needs a code change, not just a config change, to support a real production frontend origin.

---

*Related documents: [06-backend-architecture.md](./06-backend-architecture.md) · [13-security-architecture.md](./13-security-architecture.md) · [14-technology-stack.md](./14-technology-stack.md)*

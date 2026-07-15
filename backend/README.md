# Backend Module

Backend application for AI Legacy Modernization Copilot built with **Spring Boot 3**, **Java 21**, and **Clean Architecture**.

## Quick Start

### Prerequisites
- Java 21 JDK
- Maven 3.9+
- MongoDB Atlas or local MongoDB instance

### Local Development

1. **Configure environment variables** (`.env` or IDE run configuration):
   ```bash
   MONGODB_USER=testuser
   MONGODB_PASSWORD=testpass
   MONGODB_CLUSTER=localhost:27017
   JWT_SECRET=your-256-bit-secret-key
   OPENAI_API_KEY=your-openai-key
   ```

2. **Build & run**:
   ```bash
   mvn clean install
   mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
   ```

3. **Access Swagger UI**:
   - API Docs: http://localhost:8080/api/swagger-ui.html
   - OpenAPI JSON: http://localhost:8080/api/v3/api-docs

### Running Tests

```bash
mvn test
mvn verify
```

## Project Structure

- **`src/main/java`**: Java source code following Clean Architecture
- **`src/main/resources`**: Configuration files (application.yml, profiles)
- **`src/test/java`**: Unit and integration tests
- **`pom.xml`**: Maven dependencies and build configuration
- **`ARCHITECTURE.md`**: Detailed architecture documentation

## Key Features

✅ **Clean Architecture** with layered separation  
✅ **JWT Authentication** for secure API endpoints  
✅ **MongoDB** for document-based persistence  
✅ **LangChain4j** for AI model integration  
✅ **OpenAPI/Swagger** for API documentation  
✅ **Global Exception Handling** with standardized responses  
✅ **Comprehensive Logging** and audit trails  
✅ **File Upload Support** with validation  
✅ **CORS Configuration** for frontend integration

## Development Workflow

1. **Add new API endpoint**:
   - Create DTO in `interfaces.rest.dto/`
   - Create use case in `application.use_cases/`
   - Create controller in `interfaces.rest.controllers/`

2. **Add new domain logic**:
   - Define entity in `domain.entities/`
   - Add repository in `domain.repositories/`
   - Create domain service in `domain.services/`

3. **Add infrastructure**:
   - Create MongoDB repository in `infrastructure.persistence/`
   - Implement in corresponding service

4. **Write tests**:
   - Unit tests for domain logic
   - Integration tests for API endpoints
   - Mock external dependencies

## CI/CD

The project is prepared for GitHub Actions or Azure Pipelines. Configuration files will be added in the `/ops/ci/` directory.

## Deployment

Deployed on Railway via its native Java/Maven buildpack (no Docker) - `system.properties` pins the JDK version, `Procfile` declares the start command, and `mvnw`/`.mvn/` provide the Maven wrapper Railway's build uses.

## License

Apache License 2.0

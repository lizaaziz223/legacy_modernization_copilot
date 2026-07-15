package com.ailegacy.modernization.copilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application entry point for AI Legacy Modernization Copilot.
 *
 * Features:
 * - Spring Boot 3 with Java 21
 * - MongoDB persistence
 * - JWT authentication
 * - LangChain4j AI integration
 * - REST API with Swagger documentation
 * - Clean Architecture with domain-driven design
 *
 * Mongo auditing is enabled in {@link com.ailegacy.modernization.copilot.infrastructure.config.MongoConfig}.
 */
@SpringBootApplication
@EnableScheduling
public class AiLegacyModernizationCopilotApplication {

    public static void main(String[] args) {
        // mongodb+srv:// URIs make the Mongo driver resolve a DNS SRV record
        // synchronously while the "mongo" MongoClient bean is constructed - before
        // Tomcat's SmartLifecycle ever binds a port. The JVM's built-in JNDI DNS
        // client defaults to up to ~15s of retries per lookup; on a network that
        // silently drops SRV-type queries (seen on Northflank) that reads as an
        // indefinite startup hang rather than a clear error. Bounding it here makes
        // a bad lookup fail fast and loudly instead.
        System.setProperty("com.sun.jndi.dns.timeout.initial", "2000");
        System.setProperty("com.sun.jndi.dns.timeout.retries", "1");

        SpringApplication.run(AiLegacyModernizationCopilotApplication.class, args);
    }

}

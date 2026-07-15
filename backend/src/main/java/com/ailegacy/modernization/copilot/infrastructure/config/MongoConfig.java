package com.ailegacy.modernization.copilot.infrastructure.config;

import com.mongodb.ConnectionString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.boot.autoconfigure.mongo.MongoConnectionDetails;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

/**
 * MongoDB configuration.
 *
 * Enables:
 * - MongoDB repositories
 * - Auditing for created/modified timestamps
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.ailegacy.modernization.copilot.infrastructure.persistence")
@EnableMongoAuditing
public class MongoConfig {

    /**
     * Builds the Mongo connection string with the username/password percent-encoded,
     * instead of letting Spring Boot parse a YAML "${MONGODB_USER}:${MONGODB_PASSWORD}@..."
     * placeholder as a raw string. Atlas-generated passwords commonly contain reserved
     * URI characters (e.g. "@", ":"), which com.mongodb.ConnectionString rejects unless
     * percent-encoded - plain placeholder substitution never encodes them. Defining this
     * bean makes Spring Boot's MongoAutoConfiguration back off from parsing
     * spring.data.mongodb.uri itself, so the raw credential never reaches that parser.
     */
    @Bean
    public MongoConnectionDetails mongoConnectionDetails(
            @Value("${MONGODB_USER}") String user,
            @Value("${MONGODB_PASSWORD}") String password,
            @Value("${MONGODB_CLUSTER}") String cluster,
            @Value("${spring.data.mongodb.database}") String database) {

        String encodedUser = URLEncoder.encode(user, StandardCharsets.UTF_8);
        String encodedPassword = URLEncoder.encode(password, StandardCharsets.UTF_8);
        String uri = "mongodb+srv://" + encodedUser + ":" + encodedPassword + "@" + cluster
                + "/" + database + "?retryWrites=true&w=majority";
        ConnectionString connectionString = new ConnectionString(uri);

        return () -> connectionString;
    }

    /**
     * serverSelectionTimeoutMS/connectTimeoutMS/socketTimeoutMS equivalents, applied
     * via the driver's builder rather than URI query params since MongoConnectionDetails
     * only carries the ConnectionString itself.
     */
    @Bean
    public MongoClientSettingsBuilderCustomizer mongoTimeoutCustomizer() {
        return builder -> builder
                .applyToClusterSettings(cluster -> cluster.serverSelectionTimeout(15, TimeUnit.SECONDS))
                .applyToSocketSettings(socket -> socket
                        .connectTimeout(15, TimeUnit.SECONDS)
                        .readTimeout(15, TimeUnit.SECONDS));
    }
}

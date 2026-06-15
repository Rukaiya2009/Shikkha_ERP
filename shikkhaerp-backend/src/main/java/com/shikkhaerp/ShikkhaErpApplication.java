package com.shikkhaerp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableConfigurationProperties
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@EnableTransactionManagement
@EnableCaching
@EnableAsync
@EnableScheduling
public class ShikkhaErpApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShikkhaErpApplication.class, args);
        System.out.println("========================================");
        System.out.println("🚀 ShikkhaERP Application Started!");
        System.out.println("📚 API: http://localhost:8080/api");
        System.out.println("🗄️  H2 Console: http://localhost:8080/api/h2-console");
        System.out.println("📊 Actuator: http://localhost:8080/api/actuator");
        System.out.println("========================================");
    }
}
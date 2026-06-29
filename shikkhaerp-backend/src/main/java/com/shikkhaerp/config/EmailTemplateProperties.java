package com.shikkhaerp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Data
@Component
@ConfigurationProperties(prefix = "demo.email")
public class EmailTemplateProperties {
    private String from;
    private Subject subject;
    private Map<String, String> templates;

    @Data
    public static class Subject {
        private String submission;
        private String approval;
        private String rejection;
    }
}
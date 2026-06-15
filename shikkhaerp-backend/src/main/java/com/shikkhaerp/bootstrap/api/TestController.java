package com.shikkhaerp.bootstrap.api;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/test")
public class TestController {

    @GetMapping
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "🚀 ShikkhaERP API is running!");
        response.put("timestamp", LocalDateTime.now());
        response.put("status", "READY");
        response.put("version", "1.0.0");
        return response;
    }
}
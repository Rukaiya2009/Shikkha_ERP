//cat > src/main/java/com/shikkhaerp/modules/demo/dto/DemoRequestDTO.java << 'EOF'
package com.shikkhaerp.modules.demo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequestDTO {

    @Valid
    @NotNull
    private SchoolInfo school;

    @Valid
    @NotNull
    private SuperAdminInfo superAdmin;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchoolInfo {
        @NotBlank(message = "School name is required")
        private String name;

        private String address;
        private String phone;
        private String email;
        private String type;
        private Integer numberOfStudents;
        private Integer numberOfTeachers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuperAdminInfo {
        @NotBlank(message = "Super admin name is required")
        private String name;

        @NotBlank(message = "Super admin email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
    }
}

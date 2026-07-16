package com.shikkhaerp.modules.demo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * v3.0 — Simplified Get-Free-Demo workflow.
 *
 * The public stepper now collects:
 *   • School info (name, type[fixed HIGH_SCHOOL], branch, address, phone, email)
 *   • Requester info ("Your Information": name, email, phone)
 *
 * The super-admin email is NO LONGER collected here — the developer enters it
 * in the Main App after calling the school. Student/teacher counts are removed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequestDTO {

    @NotNull(message = "School information is required")
    @Valid
    private School school;

    @NotNull(message = "Requester information is required")
    @Valid
    private Requester requester;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class School {
        @NotBlank(message = "School name is required")
        private String name;

        /** Fixed to "HIGH_SCHOOL" by the UI, but kept flexible server-side. */
        private String type;

        /** New in v3.0 — e.g. "Main Campus". */
        private String branch;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "Phone is required")
        private String phone;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Requester {
        @NotBlank(message = "Your name is required")
        private String name;

        @NotBlank(message = "Your email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
    }

    // ── Convenience accessors used by the service/email layer ────────────────

    public String getSchoolName()   { return school != null ? school.getName() : null; }
    public String getSchoolType()   { return school != null ? school.getType() : null; }
    public String getBranch()       { return school != null ? school.getBranch() : null; }
    public String getAddress()      { return school != null ? school.getAddress() : null; }
    public String getPhone()        { return school != null ? school.getPhone() : null; }
    public String getEmail()        { return school != null ? school.getEmail() : null; }

    public String getRequesterName()  { return requester != null ? requester.getName() : null; }
    public String getRequesterEmail() { return requester != null ? requester.getEmail() : null; }
    public String getRequesterPhone() { return requester != null ? requester.getPhone() : null; }
}

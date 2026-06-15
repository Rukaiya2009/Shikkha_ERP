package com.shikkhaerp.modules.student.workflow;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StudentWorkflow {
    
    public enum AdmissionStatus {
        PENDING, DOCUMENT_VERIFIED, INTERVIEW_SCHEDULED, 
        INTERVIEW_COMPLETED, APPROVED, REJECTED, ENROLLED
    }
    
    private AdmissionStatus currentStatus = AdmissionStatus.PENDING;
    
    public void submitApplication() {
        if (currentStatus == AdmissionStatus.PENDING) {
            log.info("Student application submitted successfully");
            currentStatus = AdmissionStatus.DOCUMENT_VERIFIED;
        }
    }
    
    public void scheduleInterview() {
        if (currentStatus == AdmissionStatus.DOCUMENT_VERIFIED) {
            log.info("Interview scheduled for student");
            currentStatus = AdmissionStatus.INTERVIEW_SCHEDULED;
        }
    }
    
    public void approve() {
        if (currentStatus == AdmissionStatus.INTERVIEW_COMPLETED) {
            log.info("Student application approved");
            currentStatus = AdmissionStatus.APPROVED;
        }
    }
    
    public void enroll() {
        if (currentStatus == AdmissionStatus.APPROVED) {
            log.info("Student enrolled successfully");
            currentStatus = AdmissionStatus.ENROLLED;
        }
    }
    
    public AdmissionStatus getCurrentStatus() {
        return currentStatus;
    }
}
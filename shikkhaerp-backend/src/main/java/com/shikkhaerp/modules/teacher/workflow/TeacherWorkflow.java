package com.shikkhaerp.modules.teacher.workflow;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TeacherWorkflow {
    
    public enum LeaveStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
    
    public void applyForLeave(String teacherId, String reason, int days) {
        log.info("Teacher {} applied for {} days leave. Reason: {}", teacherId, days, reason);
        // Implement leave application logic
    }
    
    public void approveLeave(String leaveId) {
        log.info("Leave request {} approved", leaveId);
    }
    
    public void rejectLeave(String leaveId, String reason) {
        log.info("Leave request {} rejected. Reason: {}", leaveId, reason);
    }
}
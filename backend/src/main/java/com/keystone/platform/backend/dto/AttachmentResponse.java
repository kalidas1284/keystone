package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.WorkOrderAttachment;

import java.time.Instant;

public record AttachmentResponse(
        Long id,
        Long workOrderId,
        String originalFilename,
        String contentType,
        Long sizeBytes,
        String uploadedByName,
        Instant createdAt
) {
    public static AttachmentResponse from(WorkOrderAttachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getWorkOrder().getId(),
                attachment.getOriginalFilename(),
                attachment.getContentType(),
                attachment.getSizeBytes(),
                attachment.getUploadedBy().getFullName(),
                attachment.getCreatedAt()
        );
    }
}

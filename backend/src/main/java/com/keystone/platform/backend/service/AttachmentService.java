package com.keystone.platform.backend.service;

import com.keystone.platform.backend.dto.AttachmentResponse;
import com.keystone.platform.backend.entity.WorkOrder;
import com.keystone.platform.backend.entity.WorkOrderAttachment;
import com.keystone.platform.backend.exception.ResourceNotFoundException;
import com.keystone.platform.backend.exception.ValidationException;
import com.keystone.platform.backend.repository.WorkOrderAttachmentRepository;
import com.keystone.platform.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif",
            "application/pdf", "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final WorkOrderAttachmentRepository attachmentRepository;
    private final WorkOrderService workOrderService;
    private final SecurityUtils securityUtils;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<AttachmentResponse> list(Long workOrderId) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        workOrderService.findById(workOrderId); // enforces technician access
        return attachmentRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrder.getId()).stream()
                .map(AttachmentResponse::from)
                .toList();
    }

    @Transactional
    public AttachmentResponse upload(Long workOrderId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("File is required");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ValidationException("File size must be 10MB or less");
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new ValidationException("Unsupported file type: " + contentType);
        }

        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        workOrderService.findById(workOrderId);

        String original = sanitizeFilename(file.getOriginalFilename());
        String stored = UUID.randomUUID() + "-" + original;

        try {
            Path dir = Path.of(uploadDir, "work-orders", String.valueOf(workOrderId)).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(stored);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            WorkOrderAttachment attachment = attachmentRepository.save(WorkOrderAttachment.builder()
                    .workOrder(workOrder)
                    .uploadedBy(securityUtils.currentUser())
                    .originalFilename(original)
                    .storedFilename(stored)
                    .contentType(contentType)
                    .sizeBytes(file.getSize())
                    .build());

            return AttachmentResponse.from(attachment);
        } catch (IOException ex) {
            throw new ValidationException("Failed to store uploaded file");
        }
    }

    @Transactional(readOnly = true)
    public LoadedFile load(Long workOrderId, Long attachmentId) {
        workOrderService.findById(workOrderId);
        WorkOrderAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        if (!attachment.getWorkOrder().getId().equals(workOrderId)) {
            throw new ResourceNotFoundException("Attachment not found");
        }

        try {
            Path path = Path.of(uploadDir, "work-orders", String.valueOf(workOrderId), attachment.getStoredFilename())
                    .toAbsolutePath().normalize();
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Attachment file missing on disk");
            }
            return new LoadedFile(resource, attachment.getOriginalFilename(), attachment.getContentType());
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Attachment file missing on disk");
        }
    }

    @Transactional
    public void delete(Long workOrderId, Long attachmentId) {
        workOrderService.findById(workOrderId);
        WorkOrderAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        if (!attachment.getWorkOrder().getId().equals(workOrderId)) {
            throw new ResourceNotFoundException("Attachment not found");
        }

        Path path = Path.of(uploadDir, "work-orders", String.valueOf(workOrderId), attachment.getStoredFilename())
                .toAbsolutePath().normalize();
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // DB record still removed
        }
        attachmentRepository.delete(attachment);
    }

    private String sanitizeFilename(String name) {
        String value = name == null || name.isBlank() ? "file" : name;
        return value.replaceAll("[\\\\/]+", "_").replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public record LoadedFile(Resource resource, String filename, String contentType) {
    }
}

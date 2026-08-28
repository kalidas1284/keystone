package com.keystone.platform.backend.controller;

import com.keystone.platform.backend.dto.AttachmentResponse;
import com.keystone.platform.backend.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders/{workOrderId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<List<AttachmentResponse>> list(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(attachmentService.list(workOrderId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<AttachmentResponse> upload(
            @PathVariable Long workOrderId,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attachmentService.upload(workOrderId, file));
    }

    @GetMapping("/{attachmentId}/download")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER','TECHNICIAN')")
    public ResponseEntity<Resource> download(
            @PathVariable Long workOrderId,
            @PathVariable Long attachmentId
    ) {
        AttachmentService.LoadedFile loaded = attachmentService.load(workOrderId, attachmentId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(loaded.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + loaded.filename() + "\"")
                .body(loaded.resource());
    }

    @DeleteMapping("/{attachmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DISPATCHER')")
    public ResponseEntity<Void> delete(
            @PathVariable Long workOrderId,
            @PathVariable Long attachmentId
    ) {
        attachmentService.delete(workOrderId, attachmentId);
        return ResponseEntity.noContent().build();
    }
}

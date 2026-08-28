package com.keystone.platform.backend.dto;

import com.keystone.platform.backend.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateInvoiceStatusRequest(
        @NotNull InvoiceStatus status
) {
}

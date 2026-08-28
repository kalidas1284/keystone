package com.keystone.platform.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record TimeLogRequest(
        @NotNull @DecimalMin("1") BigDecimal minutes,
        @Size(max = 2000) String notes
) {
}

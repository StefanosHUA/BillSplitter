package com.parea.backend.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public class Requests {

    public record SessionCreateReq(
            @NotBlank(message = "Title is required") String title,
            @NotNull Long hostId
    ) {}

    public record ParticipantCreateReq(
            @NotBlank(message = "Name cannot be empty") String name
    ) {}

    // FIX: Changed @Positive to @PositiveOrZero to allow "Undo" (0.0)
    public record ParticipantSettleReq(
            @NotNull(message = "Amount is required")
            @PositiveOrZero(message = "Amount cannot be negative")
            Double amount
    ) {}

    public record ItemCreateReq(
            @NotBlank(message = "Item name is required") String name,
            @NotNull @Positive(message = "Price must be greater than zero") Double price
    ) {}

    public record LoginReq(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record RegisterReq(
            @NotBlank @Size(min = 3, max = 20, message = "Username length error")
            String username,

            @NotBlank @Email(message = "Invalid email format")
            String email,

            @NotBlank @Size(min = 8, message = "Password too short")
            String password,

            @NotBlank String confirmPassword
    ) {}

    public record GoogleLoginReq(@NotBlank String token) {}

    public record BulkItemCreateReq(
            @NotEmpty(message = "Item list cannot be empty")
            List<ItemCreateReq> items
    ) {}

}

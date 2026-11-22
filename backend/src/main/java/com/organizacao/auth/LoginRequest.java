package com.organizacao.auth;

import jakarta.validation.constraints.*;

public record LoginRequest(
        @NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inválido.") String email,
        @NotBlank(message = "Informe a senha.") String senha
) { }

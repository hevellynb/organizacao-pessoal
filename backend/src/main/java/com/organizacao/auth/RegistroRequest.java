package com.organizacao.auth;

import jakarta.validation.constraints.*;

public record RegistroRequest(
        @NotBlank(message = "Informe o nome.") @Size(max = 120) String nome,
        @NotBlank(message = "Informe o e-mail.") @Email(message = "E-mail inválido.") @Size(max = 160) String email,
        @NotBlank(message = "Informe a senha.")
        @Size(min = 8, max = 72, message = "A senha deve ter de 8 a 72 caracteres.") String senha
) { }
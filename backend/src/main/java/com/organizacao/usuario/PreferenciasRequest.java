package com.organizacao.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PreferenciasRequest(
        @Size(max = 40, message = "Use até 40 caracteres.") String apelido,
        @NotBlank(message = "Escolha uma cor.")
        @Pattern(regexp = "violet|indigo|blue|cyan|grape|pink|orange", message = "Cor inválida.") String corDestaque
) { }
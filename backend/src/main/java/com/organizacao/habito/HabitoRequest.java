package com.organizacao.habito;

import jakarta.validation.constraints.*;

public record HabitoRequest(
        @NotBlank(message = "Informe o nome do hábito.") @Size(max = 100) String nome,
        @Size(max = 300) String descricao,
        @Size(max = 100) String metaDescricao,
        @NotNull(message = "Informe a meta de dias no mês.")
        @Min(value = 1, message = "A meta mínima é 1 dia.")
        @Max(value = 31, message = "A meta máxima é 31 dias.") Integer metaDiasMes
) { }

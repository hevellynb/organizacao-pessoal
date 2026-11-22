package com.organizacao.habito;

import jakarta.validation.constraints.NotNull;

public record MarcacaoRequest(@NotNull(message = "Informe se o hábito foi feito.") Boolean feito) { }

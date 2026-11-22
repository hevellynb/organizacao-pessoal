package com.organizacao.habito;

import java.util.UUID;

public record HabitoDiaResposta(UUID id, String nome, String metaDescricao,
                                boolean feito, int diasNoMes, int metaDiasMes) { }

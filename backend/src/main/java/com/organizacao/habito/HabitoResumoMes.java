package com.organizacao.habito;

import java.util.List;
import java.util.UUID;

public record HabitoResumoMes(UUID id, String nome, int metaDiasMes, int diasRealizados,
                              int percentual, List<Integer> diasDoMes) { }

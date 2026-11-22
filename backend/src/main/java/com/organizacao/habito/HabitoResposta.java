package com.organizacao.habito;

import java.util.UUID;

public record HabitoResposta(UUID id, String nome, String descricao,
                             String metaDescricao, int metaDiasMes) {
    public static HabitoResposta de(Habito h) {
        return new HabitoResposta(h.getId(), h.getNome(), h.getDescricao(),
                h.getMetaDescricao(), h.getMetaDiasMes());
    }
}

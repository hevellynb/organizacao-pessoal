package com.organizacao.usuario;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "regra_pontuacao")
public class RegraPontuacao {

    @Id
    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "pontos_por_linha", nullable = false)
    private int pontosPorLinha = 1;

    @Column(name = "bonus_cartela", nullable = false)
    private int bonusCartela = 2;

    protected RegraPontuacao() { }

    public RegraPontuacao(UUID usuarioId) { this.usuarioId = usuarioId; }

    public UUID getUsuarioId() { return usuarioId; }
    public int getPontosPorLinha() { return pontosPorLinha; }
    public int getBonusCartela() { return bonusCartela; }

    public void atualizar(int pontosPorLinha, int bonusCartela) {
        this.pontosPorLinha = pontosPorLinha;
        this.bonusCartela = bonusCartela;
    }
}

package com.organizacao.pontos;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lancamento_pontos")
public class LancamentoPontos {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12, updatable = false)
    private TipoLancamento tipo;

    @Column(nullable = false, updatable = false)
    private int pontos; // positivo ganha, negativo gasta

    @Column(name = "cartela_id", updatable = false)
    private UUID cartelaId;

    @Column(name = "item_id", updatable = false)
    private UUID itemId; // será usado nos resgates da wishlist

    @Column(length = 200, updatable = false)
    private String descricao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    protected LancamentoPontos() { }

    public LancamentoPontos(UUID usuarioId, TipoLancamento tipo, int pontos,
                            UUID cartelaId, String descricao) {
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.pontos = pontos;
        this.cartelaId = cartelaId;
        this.descricao = descricao;
    }

    public UUID getId() { return id; }
    public TipoLancamento getTipo() { return tipo; }
    public int getPontos() { return pontos; }
    public String getDescricao() { return descricao; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public static LancamentoPontos resgate(UUID usuarioId, int pontos, UUID itemId, String descricao) {
        LancamentoPontos l = new LancamentoPontos(usuarioId, TipoLancamento.RESGATE, -pontos, null, descricao);
        l.itemId = itemId;
        return l;
    }
}

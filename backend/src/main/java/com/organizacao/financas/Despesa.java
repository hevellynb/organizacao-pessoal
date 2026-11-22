package com.organizacao.financas;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "despesa")
public class Despesa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(name = "categoria_id", nullable = false)
    private UUID categoriaId;

    @Column(nullable = false, length = 160)
    private String descricao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate data;

    @Column(length = 300)
    private String observacao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    protected Despesa() { }

    public Despesa(UUID usuarioId, UUID categoriaId, String descricao, BigDecimal valor,
                   LocalDate data, String observacao) {
        this.usuarioId = usuarioId;
        atualizar(categoriaId, descricao, valor, data, observacao);
    }

    public void atualizar(UUID categoriaId, String descricao, BigDecimal valor,
                          LocalDate data, String observacao) {
        this.categoriaId = categoriaId;
        this.descricao = descricao;
        this.valor = valor;
        this.data = data;
        this.observacao = observacao;
    }

    public UUID getId() { return id; }
    public UUID getUsuarioId() { return usuarioId; }
    public UUID getCategoriaId() { return categoriaId; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public LocalDate getData() { return data; }
    public String getObservacao() { return observacao; }
}

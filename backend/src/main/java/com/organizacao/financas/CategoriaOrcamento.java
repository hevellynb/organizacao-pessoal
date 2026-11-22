package com.organizacao.financas;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "categoria_orcamento")
public class CategoriaOrcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(nullable = false, length = 80)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, updatable = false)
    private TipoCategoria tipo = TipoCategoria.COMUM;

    @Column(name = "orcamento_mensal", nullable = false, precision = 12, scale = 2)
    private BigDecimal orcamentoMensal;

    @Column(nullable = false)
    private int ordem;

    protected CategoriaOrcamento() { }

    public CategoriaOrcamento(UUID usuarioId, String nome, TipoCategoria tipo,
                              BigDecimal orcamentoMensal, int ordem) {
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.tipo = tipo;
        this.orcamentoMensal = orcamentoMensal;
        this.ordem = ordem;
    }

    public void atualizar(String nome, BigDecimal orcamentoMensal) {
        this.nome = nome;
        this.orcamentoMensal = orcamentoMensal;
    }

    public UUID getId() { return id; }
    public UUID getUsuarioId() { return usuarioId; }
    public String getNome() { return nome; }
    public TipoCategoria getTipo() { return tipo; }
    public BigDecimal getOrcamentoMensal() { return orcamentoMensal; }
    public int getOrdem() { return ordem; }
}

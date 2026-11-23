package com.organizacao.wishlist;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "item_wishlist")
public class ItemWishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 300)
    private String descricao;

    @Column(name = "preco_estimado", nullable = false, precision = 12, scale = 2)
    private BigDecimal precoEstimado;

    @Column(name = "pontos_necessarios", nullable = false)
    private int pontosNecessarios;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Prioridade prioridade = Prioridade.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StatusItem status = StatusItem.PENDENTE;

    @Column(name = "adquirido_em")
    private OffsetDateTime adquiridoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    protected ItemWishlist() { }

    public ItemWishlist(UUID usuarioId, String nome, String descricao, BigDecimal precoEstimado,
                        int pontosNecessarios, Prioridade prioridade) {
        this.usuarioId = usuarioId;
        atualizar(nome, descricao, precoEstimado, pontosNecessarios, prioridade);
    }

    public void atualizar(String nome, String descricao, BigDecimal precoEstimado,
                          int pontosNecessarios, Prioridade prioridade) {
        this.nome = nome;
        this.descricao = descricao;
        this.precoEstimado = precoEstimado;
        this.pontosNecessarios = pontosNecessarios;
        this.prioridade = prioridade;
    }

    public void marcarAdquirido() {
        this.status = StatusItem.ADQUIRIDO;
        this.adquiridoEm = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public BigDecimal getPrecoEstimado() { return precoEstimado; }
    public int getPontosNecessarios() { return pontosNecessarios; }
    public Prioridade getPrioridade() { return prioridade; }
    public StatusItem getStatus() { return status; }
    public OffsetDateTime getAdquiridoEm() { return adquiridoEm; }
}

package com.organizacao.habito;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "habito")
public class Habito {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 300)
    private String descricao;

    @Column(name = "meta_descricao", length = 100)
    private String metaDescricao;

    @Column(name = "meta_dias_mes", nullable = false)
    private int metaDiasMes;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    protected Habito() { }

    public Habito(UUID usuarioId, String nome, String descricao, String metaDescricao, int metaDiasMes) {
        this.usuarioId = usuarioId;
        atualizar(nome, descricao, metaDescricao, metaDiasMes);
    }

    public void atualizar(String nome, String descricao, String metaDescricao, int metaDiasMes) {
        this.nome = nome;
        this.descricao = descricao;
        this.metaDescricao = metaDescricao;
        this.metaDiasMes = metaDiasMes;
    }

    public UUID getId() { return id; }
    public UUID getUsuarioId() { return usuarioId; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public String getMetaDescricao() { return metaDescricao; }
    public int getMetaDiasMes() { return metaDiasMes; }
    public boolean isAtivo() { return ativo; }
}

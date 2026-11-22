package com.organizacao.bingo;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "celula")
public class Celula {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "cartela_id", nullable = false, updatable = false)
    private UUID cartelaId;

    @Column(nullable = false, updatable = false)
    private short posicao; // SMALLINT no banco, por isso short

    @Column(nullable = false, length = 120)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private TipoCelula tipo;

    @Column(name = "habito_id")
    private UUID habitoId;

    @Column(name = "meta_dias")
    private Integer metaDias;

    @Column(name = "categoria_id")
    private UUID categoriaId;

    @Column(name = "concluida_manual", nullable = false)
    private boolean concluidaManual;

    protected Celula() { }

    public Celula(UUID cartelaId, short posicao) {
        this.cartelaId = cartelaId;
        this.posicao = posicao;
    }

    public void definir(String titulo, TipoCelula tipo, UUID habitoId,
                        Integer metaDias, UUID categoriaId) {
        this.titulo = titulo;
        this.tipo = tipo;
        this.habitoId = habitoId;
        this.metaDias = metaDias;
        this.categoriaId = categoriaId;
        this.concluidaManual = false;
    }

    public void setConcluidaManual(boolean v) { this.concluidaManual = v; }

    public short getPosicao() { return posicao; }
    public String getTitulo() { return titulo; }
    public TipoCelula getTipo() { return tipo; }
    public UUID getHabitoId() { return habitoId; }
    public Integer getMetaDias() { return metaDias; }
    public UUID getCategoriaId() { return categoriaId; }
    public boolean isConcluidaManual() { return concluidaManual; }
}

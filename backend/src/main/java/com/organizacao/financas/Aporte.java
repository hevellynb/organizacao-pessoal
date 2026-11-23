package com.organizacao.financas;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "aporte")
public class Aporte {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, updatable = false)
    private DestinoAporte destino;

    @Column(nullable = false, updatable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false, updatable = false)
    private LocalDate data;

    @Column(length = 300, updatable = false)
    private String observacao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    protected Aporte() { }

    public Aporte(UUID usuarioId, DestinoAporte destino, BigDecimal valor,
                  LocalDate data, String observacao) {
        this.usuarioId = usuarioId;
        this.destino = destino;
        this.valor = valor;
        this.data = data;
        this.observacao = observacao;
    }

    public UUID getId() { return id; }
    public DestinoAporte getDestino() { return destino; }
    public BigDecimal getValor() { return valor; }
    public LocalDate getData() { return data; }
    public String getObservacao() { return observacao; }
}

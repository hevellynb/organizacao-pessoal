package com.organizacao.financas;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "renda_mensal")
public class RendaMensal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(nullable = false, updatable = false)
    private LocalDate mes; // sempre o dia 1

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    protected RendaMensal() { }

    public RendaMensal(UUID usuarioId, LocalDate mes, BigDecimal valor) {
        this.usuarioId = usuarioId;
        this.mes = mes;
        this.valor = valor;
    }

    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDate getMes() { return mes; }
    public BigDecimal getValor() { return valor; }
}

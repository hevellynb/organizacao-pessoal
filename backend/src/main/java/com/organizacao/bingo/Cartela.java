package com.organizacao.bingo;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "cartela")
public class Cartela {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(nullable = false, updatable = false)
    private LocalDate mes; // sempre o dia 1

    @Column(nullable = false)
    private boolean fechada;

    protected Cartela() { }

    public Cartela(UUID usuarioId, LocalDate mes) {
        this.usuarioId = usuarioId;
        this.mes = mes;
    }

    public void fechar() { this.fechada = true; }

    public UUID getId() { return id; }
    public LocalDate getMes() { return mes; }
    public boolean isFechada() { return fechada; }
}

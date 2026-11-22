package com.organizacao.habito;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "registro_habito")
public class RegistroHabito {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "habito_id", nullable = false, updatable = false)
    private UUID habitoId;

    @Column(nullable = false, updatable = false)
    private LocalDate data;

    protected RegistroHabito() { }

    public RegistroHabito(UUID habitoId, LocalDate data) {
        this.habitoId = habitoId;
        this.data = data;
    }

    public UUID getHabitoId() { return habitoId; }
    public LocalDate getData() { return data; }
}

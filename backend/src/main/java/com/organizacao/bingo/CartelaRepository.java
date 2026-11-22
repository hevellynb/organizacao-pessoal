package com.organizacao.bingo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartelaRepository extends JpaRepository<Cartela, UUID> {
    Optional<Cartela> findByUsuarioIdAndMes(UUID usuarioId, LocalDate mes);
    List<Cartela> findByUsuarioIdAndFechadaFalse(UUID usuarioId);
}

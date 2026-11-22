package com.organizacao.bingo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CelulaRepository extends JpaRepository<Celula, UUID> {
    List<Celula> findByCartelaId(UUID cartelaId);
    Optional<Celula> findByCartelaIdAndPosicao(UUID cartelaId, short posicao);
}
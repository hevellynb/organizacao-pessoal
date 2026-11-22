package com.organizacao.financas;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<CategoriaOrcamento, UUID> {
    List<CategoriaOrcamento> findByUsuarioIdOrderByOrdemAscNomeAsc(UUID usuarioId);
    Optional<CategoriaOrcamento> findByIdAndUsuarioId(UUID id, UUID usuarioId);
    Optional<CategoriaOrcamento> findByUsuarioIdAndNomeIgnoreCase(UUID usuarioId, String nome);
    long countByUsuarioId(UUID usuarioId);
}

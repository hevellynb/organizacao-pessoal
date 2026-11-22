package com.organizacao.habito;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitoRepository extends JpaRepository<Habito, UUID> {
    List<Habito> findByUsuarioIdAndAtivoTrueOrderByNome(UUID usuarioId);
    Optional<Habito> findByIdAndUsuarioId(UUID id, UUID usuarioId);
}

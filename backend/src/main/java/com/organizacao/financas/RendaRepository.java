package com.organizacao.financas;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface RendaRepository extends JpaRepository<RendaMensal, UUID> {
    Optional<RendaMensal> findByUsuarioIdAndMes(UUID usuarioId, LocalDate mes);
    Optional<RendaMensal> findFirstByUsuarioIdAndMesLessThanEqualOrderByMesDesc(UUID usuarioId, LocalDate mes);
}

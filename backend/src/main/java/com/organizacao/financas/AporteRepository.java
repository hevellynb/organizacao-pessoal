package com.organizacao.financas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AporteRepository extends JpaRepository<Aporte, UUID> {

    Optional<Aporte> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    List<Aporte> findByUsuarioIdAndDataBetweenOrderByDataDescCriadoEmDesc(
            UUID usuarioId, LocalDate inicio, LocalDate fim);

    List<Aporte> findByUsuarioIdAndDestinoAndDataBetweenOrderByDataDescCriadoEmDesc(
            UUID usuarioId, DestinoAporte destino, LocalDate inicio, LocalDate fim);

    @Query("""
            select sum(a.valor) from Aporte a
            where a.usuarioId = :usuarioId and a.destino = :destino and a.data <= :fim
            """)
    BigDecimal totalAte(@Param("usuarioId") UUID usuarioId,
                        @Param("destino") DestinoAporte destino,
                        @Param("fim") LocalDate fim);

    @Query("""
            select a.destino as destino, sum(a.valor) as total
            from Aporte a
            where a.usuarioId = :usuarioId and a.data between :inicio and :fim
            group by a.destino
            """)
    List<TotalDestino> totaisPorDestino(@Param("usuarioId") UUID usuarioId,
                                        @Param("inicio") LocalDate inicio,
                                        @Param("fim") LocalDate fim);

    interface TotalDestino {
        DestinoAporte getDestino();
        BigDecimal getTotal();
    }
}

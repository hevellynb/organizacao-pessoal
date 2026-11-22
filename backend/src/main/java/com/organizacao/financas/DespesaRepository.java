package com.organizacao.financas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DespesaRepository extends JpaRepository<Despesa, UUID> {

    Optional<Despesa> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    boolean existsByCategoriaId(UUID categoriaId);

    List<Despesa> findByUsuarioIdAndDataBetweenOrderByDataDescCriadoEmDesc(
            UUID usuarioId, LocalDate inicio, LocalDate fim);

    List<Despesa> findByUsuarioIdAndCategoriaIdAndDataBetweenOrderByDataDescCriadoEmDesc(
            UUID usuarioId, UUID categoriaId, LocalDate inicio, LocalDate fim);

    @Query("""
            select d.categoriaId as categoriaId, sum(d.valor) as total
            from Despesa d
            where d.usuarioId = :usuarioId and d.data between :inicio and :fim
            group by d.categoriaId
            """)
    List<TotalCategoria> totaisPorCategoria(@Param("usuarioId") UUID usuarioId,
                                            @Param("inicio") LocalDate inicio,
                                            @Param("fim") LocalDate fim);

    @Query("""
            select sum(d.valor) from Despesa d
            where d.usuarioId = :usuarioId and d.categoriaId = :categoriaId and d.data <= :fim
            """)
    BigDecimal totalAte(@Param("usuarioId") UUID usuarioId,
                        @Param("categoriaId") UUID categoriaId,
                        @Param("fim") LocalDate fim);

    interface TotalCategoria {
        UUID getCategoriaId();
        BigDecimal getTotal();
    }
}

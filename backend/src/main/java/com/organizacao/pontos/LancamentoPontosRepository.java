package com.organizacao.pontos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface LancamentoPontosRepository extends JpaRepository<LancamentoPontos, UUID> {

    @Query("select sum(l.pontos) from LancamentoPontos l where l.usuarioId = :usuarioId")
    Long saldo(@Param("usuarioId") UUID usuarioId);

    @Query("""
            select sum(l.pontos) from LancamentoPontos l
            where l.usuarioId = :usuarioId and l.cartelaId = :cartelaId and l.tipo = :tipo
            """)
    Long somaPorCartela(@Param("usuarioId") UUID usuarioId,
                        @Param("cartelaId") UUID cartelaId,
                        @Param("tipo") TipoLancamento tipo);

    List<LancamentoPontos> findTop50ByUsuarioIdOrderByCriadoEmDesc(UUID usuarioId);
}

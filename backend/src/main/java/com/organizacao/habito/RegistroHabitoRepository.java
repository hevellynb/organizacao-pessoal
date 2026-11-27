package com.organizacao.habito;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RegistroHabitoRepository extends JpaRepository<RegistroHabito, UUID> {

    boolean existsByHabitoIdAndData(UUID habitoId, LocalDate data);

    void deleteByHabitoIdAndData(UUID habitoId, LocalDate data);

    List<RegistroHabito> findByHabitoIdInAndDataBetween(Collection<UUID> habitoIds,
                                                        LocalDate inicio, LocalDate fim);

    @Query(value = """
            SELECT to_char(data, 'YYYY-MM') AS mes, COUNT(*) AS dias
            FROM registro_habito
            WHERE habito_id = :habitoId
            GROUP BY 1
            ORDER BY 1
            """, nativeQuery = true)
    List<MesDias> historico(@Param("habitoId") UUID habitoId);

    interface MesDias {
        String getMes();
        Long getDias();
    }

    @Query("""
            select distinct r.data
            from RegistroHabito r, Habito h
            where r.habitoId = h.id and h.usuarioId = :usuarioId and r.data <= :ate
            order by r.data asc
            """)
    List<LocalDate> diasComRegistro(@Param("usuarioId") UUID usuarioId, @Param("ate") LocalDate ate);
}
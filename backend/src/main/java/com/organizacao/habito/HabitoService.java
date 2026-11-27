package com.organizacao.habito;

import com.organizacao.erro.RecursoNaoEncontradoException;
import com.organizacao.erro.RegraDeNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HabitoService {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");

    private final HabitoRepository habitos;
    private final RegistroHabitoRepository registros;

    public HabitoService(HabitoRepository habitos, RegistroHabitoRepository registros) {
        this.habitos = habitos;
        this.registros = registros;
    }

    @Transactional(readOnly = true)
    public List<HabitoResposta> listar(UUID usuarioId) {
        return habitos.findByUsuarioIdAndAtivoTrueOrderByNome(usuarioId)
                .stream().map(HabitoResposta::de).toList();
    }

    @Transactional
    public HabitoResposta criar(UUID usuarioId, HabitoRequest r) {
        Habito h = new Habito(usuarioId, r.nome().trim(), vazioParaNulo(r.descricao()),
                vazioParaNulo(r.metaDescricao()), r.metaDiasMes());
        return HabitoResposta.de(habitos.save(h));
    }

    @Transactional
    public HabitoResposta atualizar(UUID usuarioId, UUID id, HabitoRequest r) {
        Habito h = buscar(usuarioId, id);
        h.atualizar(r.nome().trim(), vazioParaNulo(r.descricao()),
                vazioParaNulo(r.metaDescricao()), r.metaDiasMes());
        return HabitoResposta.de(h);
    }

    @Transactional
    public void excluir(UUID usuarioId, UUID id) {
        habitos.delete(buscar(usuarioId, id));
    }

    @Transactional(readOnly = true)
    public List<HabitoDiaResposta> listaDoDia(UUID usuarioId, LocalDate data) {
        List<Habito> lista = habitos.findByUsuarioIdAndAtivoTrueOrderByNome(usuarioId);
        Map<UUID, List<RegistroHabito>> doMes = registrosDoMes(lista, YearMonth.from(data));
        return lista.stream().map(h -> {
            List<RegistroHabito> rs = doMes.getOrDefault(h.getId(), List.of());
            boolean feito = rs.stream().anyMatch(r -> r.getData().equals(data));
            return new HabitoDiaResposta(h.getId(), h.getNome(), h.getMetaDescricao(),
                    feito, rs.size(), h.getMetaDiasMes());
        }).toList();
    }

    @Transactional
    public void marcar(UUID usuarioId, UUID habitoId, LocalDate data, boolean feito) {
        buscar(usuarioId, habitoId); // garante que o hábito é do usuário
        if (data.isAfter(LocalDate.now(ZONA))) {
            throw new RegraDeNegocioException("Não é possível registrar hábitos em datas futuras.");
        }
        boolean existe = registros.existsByHabitoIdAndData(habitoId, data);
        if (feito && !existe) {
            registros.save(new RegistroHabito(habitoId, data));
        } else if (!feito && existe) {
            registros.deleteByHabitoIdAndData(habitoId, data);
        }
    }

    @Transactional(readOnly = true)
    public List<HabitoResumoMes> resumo(UUID usuarioId, YearMonth mes) {
        List<Habito> lista = habitos.findByUsuarioIdAndAtivoTrueOrderByNome(usuarioId);
        Map<UUID, List<RegistroHabito>> doMes = registrosDoMes(lista, mes);
        return lista.stream().map(h -> {
            List<Integer> dias = doMes.getOrDefault(h.getId(), List.of()).stream()
                    .map(r -> r.getData().getDayOfMonth()).sorted().toList();
            int percentual = Math.min(100, dias.size() * 100 / h.getMetaDiasMes());
            return new HabitoResumoMes(h.getId(), h.getNome(), h.getMetaDiasMes(),
                    dias.size(), percentual, dias);
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<HistoricoMes> historico(UUID usuarioId, UUID habitoId) {
        buscar(usuarioId, habitoId);
        return registros.historico(habitoId).stream()
                .map(m -> new HistoricoMes(m.getMes(), m.getDias())).toList();
    }

    @Transactional(readOnly = true)
    public SequenciaHabitos sequencia(UUID usuarioId) {
        LocalDate hoje = LocalDate.now(ZONA);
        List<LocalDate> dias = registros.diasComRegistro(usuarioId, hoje);
        Set<LocalDate> ativos = new HashSet<>(dias);

        // sequência atual: anda para trás a partir de hoje (ou de ontem, se hoje ainda não foi feito)
        boolean hojeFeito = ativos.contains(hoje);
        LocalDate cursor = hojeFeito ? hoje : hoje.minusDays(1);
        int atual = 0;
        while (ativos.contains(cursor)) {
            atual++;
            cursor = cursor.minusDays(1);
        }

        // melhor sequência: percorre todos os dias ativos em ordem
        int melhor = 0;
        int corrente = 0;
        LocalDate anterior = null;
        for (LocalDate dia : dias) {
            corrente = (anterior != null && dia.equals(anterior.plusDays(1))) ? corrente + 1 : 1;
            melhor = Math.max(melhor, corrente);
            anterior = dia;
        }

        return new SequenciaHabitos(atual, melhor, hojeFeito);
    }

    // ---------- apoio ----------
    private Habito buscar(UUID usuarioId, UUID id) {
        return habitos.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Hábito não encontrado."));
    }

    private Map<UUID, List<RegistroHabito>> registrosDoMes(List<Habito> lista, YearMonth mes) {
        if (lista.isEmpty()) return Map.of();
        List<UUID> ids = lista.stream().map(Habito::getId).toList();
        return registros.findByHabitoIdInAndDataBetween(ids, mes.atDay(1), mes.atEndOfMonth())
                .stream().collect(Collectors.groupingBy(RegistroHabito::getHabitoId));
    }

    private String vazioParaNulo(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}

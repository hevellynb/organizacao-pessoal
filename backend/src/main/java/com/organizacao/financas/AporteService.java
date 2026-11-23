package com.organizacao.financas;

import com.organizacao.erro.RecursoNaoEncontradoException;
import com.organizacao.erro.RegraDeNegocioException;
import com.organizacao.financas.AporteRepository.TotalDestino;
import com.organizacao.financas.FinancasDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AporteService {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final AporteRepository aportes;
    private final DespesaRepository despesas;
    private final CategoriaRepository categorias;

    public AporteService(AporteRepository aportes, DespesaRepository despesas,
                         CategoriaRepository categorias) {
        this.aportes = aportes;
        this.despesas = despesas;
        this.categorias = categorias;
    }

    @Transactional
    public AporteResposta registrar(UUID usuarioId, AporteRequest r) {
        if (r.data().isAfter(LocalDate.now(ZONA))) {
            throw new RegraDeNegocioException("Não é possível registrar aportes em datas futuras.");
        }
        String obs = (r.observacao() == null || r.observacao().isBlank()) ? null : r.observacao().trim();
        return AporteResposta.de(aportes.save(
                new Aporte(usuarioId, r.destino(), r.valor(), r.data(), obs)));
    }

    @Transactional(readOnly = true)
    public List<AporteResposta> listar(UUID usuarioId, YearMonth mes, DestinoAporte destino) {
        List<Aporte> lista = (destino == null)
                ? aportes.findByUsuarioIdAndDataBetweenOrderByDataDescCriadoEmDesc(
                usuarioId, mes.atDay(1), mes.atEndOfMonth())
                : aportes.findByUsuarioIdAndDestinoAndDataBetweenOrderByDataDescCriadoEmDesc(
                usuarioId, destino, mes.atDay(1), mes.atEndOfMonth());
        return lista.stream().map(AporteResposta::de).toList();
    }

    @Transactional
    public void excluir(UUID usuarioId, UUID id) {
        Aporte a = aportes.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aporte não encontrado."));
        if (a.getDestino() == DestinoAporte.FUNDO) {
            BigDecimal saldoSemEste = saldoFundo(usuarioId, YearMonth.now(ZONA)).subtract(a.getValor());
            if (saldoSemEste.signum() < 0) {
                throw new RegraDeNegocioException(
                        "Não é possível excluir: o fundo já gastou esse dinheiro em recompensas.");
            }
        }
        aportes.delete(a);
    }

    @Transactional(readOnly = true)
    public BigDecimal saldoFundo(UUID usuarioId, YearMonth mes) {
        CategoriaOrcamento fundo = categorias
                .findFirstByUsuarioIdAndTipo(usuarioId, TipoCategoria.FUNDO_RECOMPENSAS)
                .orElseThrow(() -> new RegraDeNegocioException(
                        "Categoria 'Fundo de recompensas' não encontrada."));
        BigDecimal aportado = nz(aportes.totalAte(usuarioId, DestinoAporte.FUNDO, mes.atEndOfMonth()));
        BigDecimal gasto = nz(despesas.totalAte(usuarioId, fundo.getId(), mes.atEndOfMonth()));
        return aportado.subtract(gasto);
    }

    @Transactional(readOnly = true)
    public BigDecimal saldoReserva(UUID usuarioId, YearMonth mes) {
        return nz(aportes.totalAte(usuarioId, DestinoAporte.RESERVA, mes.atEndOfMonth()));
    }

    @Transactional(readOnly = true)
    public Map<DestinoAporte, BigDecimal> totaisDoMes(UUID usuarioId, YearMonth mes) {
        return aportes.totaisPorDestino(usuarioId, mes.atDay(1), mes.atEndOfMonth()).stream()
                .collect(Collectors.toMap(TotalDestino::getDestino, TotalDestino::getTotal));
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? ZERO : v;
    }
}

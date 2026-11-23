package com.organizacao.wishlist;

import com.organizacao.bingo.BingoService;
import com.organizacao.erro.RecursoNaoEncontradoException;
import com.organizacao.erro.RegraDeNegocioException;
import com.organizacao.financas.FinancasService;
import com.organizacao.pontos.LancamentoPontos;
import com.organizacao.pontos.LancamentoPontosRepository;
import com.organizacao.usuario.RegraPontuacaoRepository;
import com.organizacao.wishlist.WishlistDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class WishlistService {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");

    private static final Comparator<ItemWishlist> ORDEM = Comparator
            .comparing((ItemWishlist i) -> i.getStatus() == StatusItem.ADQUIRIDO)
            .thenComparing(ItemWishlist::getPrioridade)
            .thenComparing(ItemWishlist::getNome, String.CASE_INSENSITIVE_ORDER);

    private record Contexto(YearMonth mes, int saldo, BigDecimal fundo) { }

    private final ItemWishlistRepository itens;
    private final RegraPontuacaoRepository regras;
    private final LancamentoPontosRepository lancamentos;
    private final BingoService bingo;
    private final FinancasService financas;

    public WishlistService(ItemWishlistRepository itens, RegraPontuacaoRepository regras,
                           LancamentoPontosRepository lancamentos, BingoService bingo,
                           FinancasService financas) {
        this.itens = itens;
        this.regras = regras;
        this.lancamentos = lancamentos;
        this.bingo = bingo;
        this.financas = financas;
    }

    @Transactional
    public WishlistResposta listar(UUID usuarioId) {
        Contexto ctx = contexto(usuarioId);
        List<ItemResposta> lista = itens.findByUsuarioId(usuarioId).stream()
                .sorted(ORDEM).map(i -> resposta(i, ctx.saldo(), ctx.fundo())).toList();
        return new WishlistResposta(ctx.mes().toString(), ctx.saldo(), ctx.fundo(), lista);
    }

    @Transactional
    public ItemResposta criar(UUID usuarioId, ItemRequest r) {
        int pontos = r.pontosNecessarios() != null ? r.pontosNecessarios() : sugerirPontos(r.precoEstimado());
        Prioridade prioridade = r.prioridade() != null ? r.prioridade() : Prioridade.MEDIA;
        ItemWishlist item = itens.save(new ItemWishlist(usuarioId, r.nome().trim(),
                vazioParaNulo(r.descricao()), r.precoEstimado(), pontos, prioridade));
        Contexto ctx = contexto(usuarioId);
        return resposta(item, ctx.saldo(), ctx.fundo());
    }

    @Transactional
    public ItemResposta atualizar(UUID usuarioId, UUID id, ItemRequest r) {
        ItemWishlist item = buscar(usuarioId, id);
        if (item.getStatus() == StatusItem.ADQUIRIDO) {
            throw new RegraDeNegocioException("Um item já adquirido não pode ser editado.");
        }
        int pontos = r.pontosNecessarios() != null ? r.pontosNecessarios() : sugerirPontos(r.precoEstimado());
        Prioridade prioridade = r.prioridade() != null ? r.prioridade() : Prioridade.MEDIA;
        item.atualizar(r.nome().trim(), vazioParaNulo(r.descricao()), r.precoEstimado(), pontos, prioridade);
        Contexto ctx = contexto(usuarioId);
        return resposta(item, ctx.saldo(), ctx.fundo());
    }

    @Transactional
    public void excluir(UUID usuarioId, UUID id) {
        itens.delete(buscar(usuarioId, id));
    }

    @Transactional
    public ResgateResposta resgatar(UUID usuarioId, UUID itemId, BigDecimal precoPago) {
        regras.travar(usuarioId);

        ItemWishlist item = buscar(usuarioId, itemId);
        if (item.getStatus() == StatusItem.ADQUIRIDO) {
            throw new RegraDeNegocioException("Este item já foi adquirido.");
        }
        BigDecimal valor = precoPago != null ? precoPago : item.getPrecoEstimado();

        int saldo = bingo.saldo(usuarioId);
        if (saldo < item.getPontosNecessarios()) {
            throw new RegraDeNegocioException("Pontos insuficientes: você tem " + saldo
                    + " e o item custa " + item.getPontosNecessarios() + ".");
        }

        YearMonth mes = YearMonth.now(ZONA);
        BigDecimal fundo = financas.fundoRecompensasRestante(usuarioId, mes);
        if (fundo.compareTo(valor) < 0) {
            throw new RegraDeNegocioException("O saldo do fundo de recompensas é " + moeda(fundo)
                    + ", menos que o valor do item (" + moeda(valor) + ").");
        }

        lancamentos.save(LancamentoPontos.resgate(usuarioId, item.getPontosNecessarios(),
                item.getId(), "Resgate: " + item.getNome()));
        financas.lancarNoFundoDeRecompensas(usuarioId, "Recompensa: " + item.getNome(),
                valor, LocalDate.now(ZONA));
        item.marcarAdquirido();

        int novoSaldo = saldo - item.getPontosNecessarios();
        BigDecimal novoFundo = fundo.subtract(valor);
        return new ResgateResposta(resposta(item, novoSaldo, novoFundo),
                item.getPontosNecessarios(), novoSaldo, valor, novoFundo);
    }

    private Contexto contexto(UUID usuarioId) {
        YearMonth mes = YearMonth.now(ZONA);
        return new Contexto(mes, bingo.saldo(usuarioId),
                financas.fundoRecompensasRestante(usuarioId, mes));
    }

    private ItemResposta resposta(ItemWishlist i, int saldo, BigDecimal fundo) {
        boolean pendente = i.getStatus() == StatusItem.PENDENTE;
        boolean pontosOk = saldo >= i.getPontosNecessarios();
        boolean fundoOk = fundo.compareTo(i.getPrecoEstimado()) >= 0;
        return new ItemResposta(i.getId(), i.getNome(), i.getDescricao(), i.getPrecoEstimado(),
                i.getPontosNecessarios(), i.getPrioridade(), i.getStatus(), i.getAdquiridoEm(),
                pontosOk, fundoOk, pendente && pontosOk && fundoOk);
    }

    private int sugerirPontos(BigDecimal preco) {
        int pontos = preco.divide(BigDecimal.valueOf(30), 0, RoundingMode.CEILING).intValue();
        return Math.max(1, pontos);
    }

    private ItemWishlist buscar(UUID usuarioId, UUID id) {
        return itens.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item não encontrado."));
    }

    private String moeda(BigDecimal valor) {
        return NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR")).format(valor);
    }

    private String vazioParaNulo(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}

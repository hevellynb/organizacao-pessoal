package com.organizacao.painel;

import com.organizacao.bingo.BingoDtos.CartelaResposta;
import com.organizacao.bingo.BingoDtos.CelulaResposta;
import com.organizacao.bingo.BingoService;
import com.organizacao.financas.FinancasService;
import com.organizacao.habito.HabitoResumoMes;
import com.organizacao.habito.HabitoService;
import com.organizacao.painel.PainelGeralDtos.*;
import com.organizacao.wishlist.WishlistDtos.ItemResposta;
import com.organizacao.wishlist.WishlistDtos.WishlistResposta;
import com.organizacao.wishlist.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class PainelGeralService {

    private final HabitoService habitos;
    private final BingoService bingo;
    private final FinancasService financas;
    private final WishlistService wishlist;

    public PainelGeralService(HabitoService habitos, BingoService bingo,
                              FinancasService financas, WishlistService wishlist) {
        this.habitos = habitos;
        this.bingo = bingo;
        this.financas = financas;
        this.wishlist = wishlist;
    }

    @Transactional
    public PainelGeralResposta obter(UUID usuarioId, YearMonth mes) {
        // hábitos: progresso geral do mês (cada hábito conta no máximo até a sua meta)
        List<HabitoResumoMes> resumo = habitos.resumo(usuarioId, mes);
        int feitos = resumo.stream()
                .mapToInt(h -> Math.min(h.diasRealizados(), h.metaDiasMes())).sum();
        int meta = resumo.stream().mapToInt(HabitoResumoMes::metaDiasMes).sum();
        HabitosResumo hab = new HabitosResumo(resumo.size(), feitos, meta,
                meta == 0 ? 0 : feitos * 100 / meta);

        // bingo e pontos
        CartelaResposta cartela = bingo.obter(usuarioId, mes);
        int definidas = (int) cartela.celulas().stream().filter(CelulaResposta::definida).count();
        int concluidas = (int) cartela.celulas().stream()
                .filter(c -> c.definida() && c.concluida()).count();
        BingoResumo b = new BingoResumo(definidas, concluidas, cartela.quantidadeLinhas(),
                cartela.cartelaCompleta(), cartela.pontosDoMes());

        // recompensas liberadas (a wishlist sempre reflete o momento atual)
        WishlistResposta w = wishlist.listar(usuarioId);
        List<ItemResposta> disponiveis = w.itens().stream()
                .filter(ItemResposta::disponivelParaResgate).toList();

        return new PainelGeralResposta(mes.toString(), hab, b, cartela.saldoPontos(),
                financas.painel(usuarioId, mes), disponiveis);
    }
}

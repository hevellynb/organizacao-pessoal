package com.organizacao.wishlist;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class WishlistDtos {

    private WishlistDtos() { }

    public record ItemRequest(
            @NotBlank(message = "Informe o nome do item.") @Size(max = 120) String nome,
            @Size(max = 300) String descricao,
            @NotNull(message = "Informe o preço estimado.")
            @DecimalMin(value = "0.00", message = "O preço não pode ser negativo.")
            @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais.") BigDecimal precoEstimado,
            @Min(value = 1, message = "A pontuação mínima é 1.")
            @Max(value = 1000, message = "A pontuação máxima é 1000.") Integer pontosNecessarios,
            Prioridade prioridade) { }

    public record ItemResposta(UUID id, String nome, String descricao, BigDecimal precoEstimado,
                               int pontosNecessarios, Prioridade prioridade, StatusItem status,
                               OffsetDateTime adquiridoEm, boolean pontosSuficientes,
                               boolean fundoSuficiente, boolean disponivelParaResgate) { }

    public record WishlistResposta(String mes, int saldoPontos, BigDecimal fundoDisponivel,
                                   List<ItemResposta> itens) { }

    public record ResgateRequest(
            @DecimalMin(value = "0.01", message = "O valor pago deve ser maior que zero.")
            @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais.") BigDecimal precoPago) { }

    public record ResgateResposta(ItemResposta item, int pontosGastos, int saldoPontos,
                                  BigDecimal valorLancado, BigDecimal fundoDisponivel) { }
}

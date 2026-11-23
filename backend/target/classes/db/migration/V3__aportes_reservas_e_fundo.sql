CREATE TABLE aporte (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        usuario_id  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                        destino     VARCHAR(10) NOT NULL CHECK (destino IN ('RESERVA', 'FUNDO')),
                        valor       NUMERIC(12,2) NOT NULL CHECK (valor > 0),
                        data        DATE NOT NULL,
                        observacao  VARCHAR(300),
                        criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_aporte_usuario_destino_data ON aporte(usuario_id, destino, data);

-- lançamentos que já existiam na categoria Economia viram aportes na reserva
INSERT INTO aporte (usuario_id, destino, valor, data, observacao)
SELECT d.usuario_id, 'RESERVA', d.valor, d.data, COALESCE(d.observacao, d.descricao)
FROM despesa d
         JOIN categoria_orcamento c ON c.id = d.categoria_id
WHERE c.tipo = 'ECONOMIA';

DELETE FROM despesa
WHERE categoria_id IN (SELECT id FROM categoria_orcamento WHERE tipo = 'ECONOMIA');
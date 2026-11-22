-- Cria as 7 categorias padrão para usuários que ainda não têm nenhuma
INSERT INTO categoria_orcamento (usuario_id, nome, tipo, orcamento_mensal, ordem)
SELECT u.id, c.nome, c.tipo, c.valor, c.ordem
FROM usuario u
         CROSS JOIN (VALUES
                         ('Economia',                   'ECONOMIA',          250.00, 1),
                         ('Transporte',                 'COMUM',             100.00, 2),
                         ('Alimentação fora',           'COMUM',             220.00, 3),
                         ('Entretenimento e eventos',   'COMUM',             150.00, 4),
                         ('Compras pessoais',           'COMUM',             120.00, 5),
                         ('Fundo de recompensas',       'FUNDO_RECOMPENSAS', 100.00, 6),
                         ('Imprevistos e margem livre', 'COMUM',              60.00, 7)
) AS c(nome, tipo, valor, ordem)
WHERE NOT EXISTS (
    SELECT 1 FROM categoria_orcamento x WHERE x.usuario_id = u.id
);
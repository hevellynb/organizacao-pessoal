-- ============ USUÁRIO ============
CREATE TABLE usuario (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         nome        VARCHAR(120) NOT NULL,
                         email       VARCHAR(160) NOT NULL UNIQUE,
                         senha_hash  VARCHAR(100) NOT NULL,
                         criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE regra_pontuacao (
                                 usuario_id       UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
                                 pontos_por_linha INT NOT NULL DEFAULT 1 CHECK (pontos_por_linha >= 0),
                                 bonus_cartela    INT NOT NULL DEFAULT 2 CHECK (bonus_cartela >= 0)
);

-- ============ HÁBITOS ============
CREATE TABLE habito (
                        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        usuario_id       UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                        nome             VARCHAR(100) NOT NULL,
                        descricao        VARCHAR(300),
                        meta_descricao   VARCHAR(100),                       -- ex.: "30 minutos"
                        meta_dias_mes    INT NOT NULL DEFAULT 20 CHECK (meta_dias_mes BETWEEN 1 AND 31),
                        ativo            BOOLEAN NOT NULL DEFAULT TRUE,
                        criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_habito_usuario ON habito(usuario_id);

CREATE TABLE registro_habito (
                                 id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 habito_id  UUID NOT NULL REFERENCES habito(id) ON DELETE CASCADE,
                                 data       DATE NOT NULL,
                                 CONSTRAINT uq_registro_habito_dia UNIQUE (habito_id, data)
);
CREATE INDEX idx_registro_data ON registro_habito(data);

-- ============ FINANÇAS ============
CREATE TABLE categoria_orcamento (
                                     id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     usuario_id       UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                                     nome             VARCHAR(80) NOT NULL,
                                     tipo             VARCHAR(20) NOT NULL DEFAULT 'COMUM'
                                         CHECK (tipo IN ('COMUM','ECONOMIA','FUNDO_RECOMPENSAS')),
                                     orcamento_mensal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (orcamento_mensal >= 0),
                                     ordem            INT NOT NULL DEFAULT 0,
                                     ativa            BOOLEAN NOT NULL DEFAULT TRUE,
                                     CONSTRAINT uq_categoria_nome UNIQUE (usuario_id, nome)
);
-- no máximo uma categoria ECONOMIA e uma FUNDO_RECOMPENSAS por usuário
CREATE UNIQUE INDEX uq_categoria_tipo_especial
    ON categoria_orcamento(usuario_id, tipo) WHERE tipo <> 'COMUM';

CREATE TABLE renda_mensal (
                              id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              usuario_id  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                              mes         DATE NOT NULL CHECK (EXTRACT(DAY FROM mes) = 1),  -- sempre dia 1
                              valor       NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
                              CONSTRAINT uq_renda_mes UNIQUE (usuario_id, mes)
);

CREATE TABLE despesa (
                         id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         usuario_id    UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                         categoria_id  UUID NOT NULL REFERENCES categoria_orcamento(id),
                         descricao     VARCHAR(160) NOT NULL,
                         valor         NUMERIC(12,2) NOT NULL CHECK (valor > 0),
                         data          DATE NOT NULL,
                         observacao    VARCHAR(300),
                         criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_despesa_usuario_data ON despesa(usuario_id, data);
CREATE INDEX idx_despesa_categoria ON despesa(categoria_id);

-- ============ BINGO ============
CREATE TABLE cartela (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         usuario_id  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                         mes         DATE NOT NULL CHECK (EXTRACT(DAY FROM mes) = 1),
                         fechada     BOOLEAN NOT NULL DEFAULT FALSE,
                         CONSTRAINT uq_cartela_mes UNIQUE (usuario_id, mes)
);

CREATE TABLE celula (
                        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        cartela_id         UUID NOT NULL REFERENCES cartela(id) ON DELETE CASCADE,
                        posicao            SMALLINT NOT NULL CHECK (posicao BETWEEN 0 AND 24),
                        titulo             VARCHAR(120) NOT NULL,
                        tipo               VARCHAR(12) NOT NULL CHECK (tipo IN ('HABITO','FINANCEIRA','MANUAL')),
                        habito_id          UUID REFERENCES habito(id) ON DELETE SET NULL,
                        meta_dias          INT CHECK (meta_dias BETWEEN 1 AND 31),
                        categoria_id       UUID REFERENCES categoria_orcamento(id) ON DELETE SET NULL,
                        concluida_manual   BOOLEAN NOT NULL DEFAULT FALSE,
                        CONSTRAINT uq_celula_posicao UNIQUE (cartela_id, posicao),
    -- coerência entre o tipo e os campos usados
                        CONSTRAINT ck_celula_tipo CHECK (
                            (tipo = 'HABITO'     AND meta_dias IS NOT NULL) OR
                            (tipo = 'FINANCEIRA') OR
                            (tipo = 'MANUAL')
                            )
);

-- ============ WISHLIST E PONTOS ============
CREATE TABLE item_wishlist (
                               id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               usuario_id         UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                               nome               VARCHAR(120) NOT NULL,
                               descricao          VARCHAR(300),
                               preco_estimado     NUMERIC(12,2) NOT NULL CHECK (preco_estimado >= 0),
                               pontos_necessarios INT NOT NULL CHECK (pontos_necessarios > 0),
                               prioridade         VARCHAR(8) NOT NULL DEFAULT 'MEDIA' CHECK (prioridade IN ('ALTA','MEDIA','BAIXA')),
                               status             VARCHAR(10) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','ADQUIRIDO')),
                               adquirido_em       TIMESTAMPTZ,
                               criado_em          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wishlist_usuario ON item_wishlist(usuario_id, status);

CREATE TABLE lancamento_pontos (
                                   id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   usuario_id      UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                                   tipo            VARCHAR(12) NOT NULL CHECK (tipo IN ('GANHO_BINGO','RESGATE','AJUSTE')),
                                   pontos          INT NOT NULL CHECK (pontos <> 0),     -- positivo ganha, negativo gasta
                                   cartela_id      UUID REFERENCES cartela(id) ON DELETE SET NULL,
                                   item_id         UUID REFERENCES item_wishlist(id) ON DELETE SET NULL,
                                   descricao       VARCHAR(200),
                                   criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pontos_usuario ON lancamento_pontos(usuario_id);
CREATE INDEX idx_pontos_cartela ON lancamento_pontos(cartela_id);
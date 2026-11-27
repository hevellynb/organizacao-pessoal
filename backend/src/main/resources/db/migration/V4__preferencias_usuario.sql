ALTER TABLE usuario
    ADD COLUMN apelido      VARCHAR(40),
    ADD COLUMN cor_destaque VARCHAR(20) NOT NULL DEFAULT 'violet';
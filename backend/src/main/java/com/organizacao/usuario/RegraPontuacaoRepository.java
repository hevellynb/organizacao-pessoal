package com.organizacao.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RegraPontuacaoRepository extends JpaRepository<RegraPontuacao, UUID> { }

package com.organizacao.usuario;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;

    @Column(length = 40)
    private String apelido;

    @Column(name = "cor_destaque", nullable = false, length = 20)
    private String corDestaque = "violet";

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm = OffsetDateTime.now();

    protected Usuario() { } // exigido pelo JPA

    public Usuario(String nome, String email, String senhaHash) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
    }

    public void atualizarPreferencias(String apelido, String corDestaque) {
        this.apelido = apelido;
        this.corDestaque = corDestaque;
    }

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenhaHash() { return senhaHash; }
    public String getApelido() { return apelido; }
    public String getCorDestaque() { return corDestaque; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
}
package com.organizacao.erro;

public class EmailJaCadastradoException extends RuntimeException {
    public EmailJaCadastradoException() { super("E-mail já cadastrado."); }
}

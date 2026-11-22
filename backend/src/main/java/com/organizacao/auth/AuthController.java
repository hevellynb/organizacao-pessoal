package com.organizacao.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) { this.service = service; }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResposta registro(@Valid @RequestBody RegistroRequest req) {
        return service.registrar(req);
    }

    @PostMapping("/login")
    public AuthResposta login(@Valid @RequestBody LoginRequest req) {
        return service.login(req);
    }
}

package com.ellp.voluntarios.controller;

import com.ellp.voluntarios.dto.LoginResponse;
import com.ellp.voluntarios.dto.AlterarSenhaRequest;
import com.ellp.voluntarios.dto.DefinirSenhaPrimeiroAcessoRequest;
import com.ellp.voluntarios.dto.LoginRequest;
import com.ellp.voluntarios.dto.PrimeiroAcessoRequest;
import com.ellp.voluntarios.dto.PrimeiroAcessoResponse;
import com.ellp.voluntarios.dto.UsuarioResponse;
import com.ellp.voluntarios.security.JwtTokenService;
import com.ellp.voluntarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService service;
    private final JwtTokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        var usuario = service.login(request.getEmail(), request.getSenha());
        return ResponseEntity.ok(new LoginResponse(
                tokenService.gerarToken(usuario),
                UsuarioResponse.from(usuario)
        ));
    }

    @PostMapping("/primeiro-acesso")
    public ResponseEntity<PrimeiroAcessoResponse> primeiroAcesso(
            @Valid @RequestBody PrimeiroAcessoRequest request) {
        var usuario = service.prepararPrimeiroAcesso(request.getEmail());
        return ResponseEntity.ok(new PrimeiroAcessoResponse(
                usuario.getId(),
                tokenService.gerarTokenPrimeiroAcesso(usuario)
        ));
    }

    @PatchMapping("/{id}/primeiro-acesso/senha")
    @PreAuthorize("@autorizacaoService.podeDefinirSenhaPrimeiroAcesso(authentication, #id)")
    public ResponseEntity<UsuarioResponse> definirSenhaPrimeiroAcesso(
            @PathVariable Long id,
            @Valid @RequestBody DefinirSenhaPrimeiroAcessoRequest request) {
        var usuario = service.definirSenhaPrimeiroAcesso(
                id,
                request.getSenha(),
                request.getConfirmarSenha()
        );
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }

    @PatchMapping("/{id}/alterar-senha")
    @PreAuthorize("@autorizacaoService.ehMesmoUsuario(authentication, #id)")
    public ResponseEntity<UsuarioResponse> alterarSenha(
            @PathVariable Long id,
            @Valid @RequestBody AlterarSenhaRequest request) {
        var usuario = service.alterarSenha(id, request.getSenhaAtual(), request.getNovaSenha());
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }
}

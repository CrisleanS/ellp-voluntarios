package com.ellp.voluntarios.controller;

import com.ellp.voluntarios.dto.LoginRequest;
import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService service;

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@Valid @RequestBody LoginRequest request) {
        Usuario usuario = service.login(request.getEmail(), request.getSenha());
        return ResponseEntity.ok(usuario);
    }
}

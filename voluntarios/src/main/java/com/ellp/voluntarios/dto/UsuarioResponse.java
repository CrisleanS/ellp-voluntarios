package com.ellp.voluntarios.dto;

import com.ellp.voluntarios.model.Usuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String tipo,
        Boolean primeiroLogin,
        Long voluntarioId
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo(),
                usuario.getPrimeiroLogin(),
                usuario.getVoluntarioId()
        );
    }
}

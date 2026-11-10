package com.ellp.voluntarios.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component("autorizacaoService")
public class AutorizacaoService {

    public boolean podeAcessarVoluntario(Authentication authentication, Long voluntarioId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        if (authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }
        if (!(authentication instanceof JwtAuthenticationToken jwt)) {
            return false;
        }
        if (authentication.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_VOLUNTARIO"))) {
            return false;
        }

        Number idDoVoluntario = jwt.getToken().getClaim("voluntarioId");
        return idDoVoluntario != null && idDoVoluntario.longValue() == voluntarioId;
    }

    public boolean ehMesmoUsuario(Authentication authentication, Long usuarioId) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication instanceof JwtAuthenticationToken jwt)) {
            return false;
        }

        if (jwt.getToken().hasClaim("purpose")) {
            return false;
        }

        Number idDoUsuario = jwt.getToken().getClaim("uid");
        return idDoUsuario != null && idDoUsuario.longValue() == usuarioId;
    }

    public boolean podeDefinirSenhaPrimeiroAcesso(Authentication authentication, Long usuarioId) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication instanceof JwtAuthenticationToken jwt)
                || !"first_access".equals(jwt.getToken().getClaimAsString("purpose"))) {
            return false;
        }

        Number idDoUsuario = jwt.getToken().getClaim("uid");
        return idDoUsuario != null && idDoUsuario.longValue() == usuarioId;
    }
}

package com.ellp.voluntarios.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class SecurityConfigTest {

    private final SecurityConfig config = new SecurityConfig();

    @Test
    void deve_validar_segredo_jwt_vazio_e_curto() {
        assertThrows(IllegalStateException.class, () -> config.jwtSecretKey(""));
        assertThrows(IllegalStateException.class,
                () -> config.jwtSecretKey(Base64.getEncoder().encodeToString(new byte[16])));
    }

    @Test
    void deve_criar_encoder_decoder_e_codificar_senha() {
        String secret = Base64.getEncoder().encodeToString(new byte[32]);
        var key = config.jwtSecretKey(secret);
        JwtEncoder encoder = config.jwtEncoder(key);
        JwtDecoder decoder = config.jwtDecoder(key);
        PasswordEncoder passwordEncoder = config.passwordEncoder();

        assertNotNull(encoder);
        assertNotNull(decoder);
        String hash = passwordEncoder.encode("senha-de-teste");
        assertTrue(passwordEncoder.matches("senha-de-teste", hash));
        assertFalse(passwordEncoder.matches("senha-errada", hash));
    }

    @Test
    void deve_configurar_origens_cors_e_metodos_permitidos() {
        CorsConfigurationSource source = config.corsConfigurationSource(
                " https://site.example , http://localhost:5173 ");
        var cors = source.getCorsConfiguration(
                new org.springframework.mock.web.MockHttpServletRequest("GET", "/api/voluntarios"));

        assertEquals(java.util.List.of("https://site.example", "http://localhost:5173"),
                cors.getAllowedOrigins());
        assertTrue(cors.getAllowedMethods().contains("OPTIONS"));
        assertTrue(cors.getAllowedHeaders().contains("Authorization"));
        assertTrue(cors.getExposedHeaders().contains("Content-Disposition"));
    }
}

package com.ellp.voluntarios.controller;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class UsuarioControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private UsuarioService service;

    private MockMvc mockMvc;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

        usuario = Usuario.builder()
                .id(1L)
                .nome("Admin ELLP")
                .email("admin@ellp.com")
                .senha("admin123")
                .tipo("ADMIN")
                .primeiroLogin(true)
                .build();
    }

    // ── login ──

    @Test
    void post_login_deve_retornar_200_com_usuario() throws Exception {
        when(service.login("admin@ellp.com", "admin123")).thenReturn(usuario);

        String json = """
                {
                  "email": "admin@ellp.com",
                  "senha": "admin123"
                }
                """;

        mockMvc.perform(post("/api/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Admin ELLP"))
                .andExpect(jsonPath("$.tipo").value("ADMIN"))
                .andExpect(jsonPath("$.primeiroLogin").value(true));
    }

    @Test
    void post_login_deve_retornar_400_credenciais_invalidas() throws Exception {
        when(service.login("admin@ellp.com", "senhaErrada"))
                .thenThrow(new IllegalArgumentException("E-mail ou senha inválidos."));

        String json = """
                {
                  "email": "admin@ellp.com",
                  "senha": "senhaErrada"
                }
                """;

        mockMvc.perform(post("/api/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("E-mail ou senha inválidos."));
    }

    @Test
    void post_login_deve_retornar_400_email_em_branco() throws Exception {
        String json = """
                {
                  "email": "",
                  "senha": "admin123"
                }
                """;

        mockMvc.perform(post("/api/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    // ── alterar senha ──

    @Test
    void patch_alterar_senha_deve_retornar_200() throws Exception {
        Usuario atualizado = Usuario.builder()
                .id(1L)
                .nome("Admin ELLP")
                .email("admin@ellp.com")
                .senha("novaSenha456")
                .tipo("ADMIN")
                .primeiroLogin(false)
                .build();

        when(service.alterarSenha(eq(1L), eq("admin123"), eq("novaSenha456")))
                .thenReturn(atualizado);

        String json = """
                {
                  "senhaAtual": "admin123",
                  "novaSenha": "novaSenha456"
                }
                """;

        mockMvc.perform(patch("/api/usuarios/1/alterar-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.primeiroLogin").value(false));
    }

    @Test
    void patch_alterar_senha_deve_retornar_400_senha_atual_incorreta() throws Exception {
        when(service.alterarSenha(eq(1L), eq("errada"), eq("novaSenha456")))
                .thenThrow(new IllegalArgumentException("Senha atual incorreta."));

        String json = """
                {
                  "senhaAtual": "errada",
                  "novaSenha": "novaSenha456"
                }
                """;

        mockMvc.perform(patch("/api/usuarios/1/alterar-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Senha atual incorreta."));
    }

    @Test
    void patch_alterar_senha_deve_retornar_400_nova_senha_igual() throws Exception {
        when(service.alterarSenha(eq(1L), eq("admin123"), eq("admin123")))
                .thenThrow(new IllegalArgumentException("A nova senha deve ser diferente da atual."));

        String json = """
                {
                  "senhaAtual": "admin123",
                  "novaSenha": "admin123"
                }
                """;

        mockMvc.perform(patch("/api/usuarios/1/alterar-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("A nova senha deve ser diferente da atual."));
    }

    @Test
    void patch_alterar_senha_deve_retornar_404_usuario_inexistente() throws Exception {
        when(service.alterarSenha(eq(99L), any(), any()))
                .thenThrow(new RecursoNaoEncontradoException("Usuário não encontrado: 99"));

        String json = """
                {
                  "senhaAtual": "qualquer",
                  "novaSenha": "novaSenha456"
                }
                """;

        mockMvc.perform(patch("/api/usuarios/99/alterar-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Usuário não encontrado: 99"));
    }

    @Test
    void patch_alterar_senha_deve_retornar_400_campos_em_branco() throws Exception {
        String json = """
                {
                  "senhaAtual": "",
                  "novaSenha": ""
                }
                """;

        mockMvc.perform(patch("/api/usuarios/1/alterar-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}

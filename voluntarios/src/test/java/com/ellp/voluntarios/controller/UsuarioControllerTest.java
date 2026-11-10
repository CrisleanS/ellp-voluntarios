package com.ellp.voluntarios.controller;

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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
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
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .defaultRequest(post("/").with(SecurityMockMvcRequestPostProcessors.jwt()
                        .jwt(jwt -> jwt.claim("uid", 1L))
                        .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .build();

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
                .andExpect(jsonPath("$.usuario.nome").value("Admin ELLP"))
                .andExpect(jsonPath("$.usuario.tipo").value("ADMIN"))
                .andExpect(jsonPath("$.usuario.primeiroLogin").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.senha").doesNotExist());
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

    @Test
    void post_primeiro_acesso_deve_retornar_token_temporario() throws Exception {
        when(service.prepararPrimeiroAcesso("admin@ellp.com")).thenReturn(usuario);

        mockMvc.perform(post("/api/usuarios/primeiro-acesso")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@ellp.com"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value(1))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void post_primeiro_acesso_deve_validar_formato_do_email() throws Exception {
        mockMvc.perform(post("/api/usuarios/primeiro-acesso")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"email-invalido"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("E-mail inválido."));
    }

    @Test
    void post_primeiro_acesso_deve_informar_email_nao_cadastrado() throws Exception {
        when(service.prepararPrimeiroAcesso("naoexiste@email.com"))
                .thenThrow(new IllegalArgumentException("Usuário não foi cadastrado."));

        mockMvc.perform(post("/api/usuarios/primeiro-acesso")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"naoexiste@email.com"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Usuário não foi cadastrado."));
    }

    @Test
    void patch_primeiro_acesso_deve_definir_senha_sem_senha_atual() throws Exception {
        Usuario atualizado = Usuario.builder()
                .id(1L)
                .nome("Admin ELLP")
                .email("admin@ellp.com")
                .senha("$2a$encoded")
                .tipo("ADMIN")
                .primeiroLogin(false)
                .build();
        when(service.definirSenhaPrimeiroAcesso(1L, "SenhaForte1!", "SenhaForte1!"))
                .thenReturn(atualizado);

        mockMvc.perform(patch("/api/usuarios/1/primeiro-acesso/senha")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt.claim("uid", 1L).claim("purpose", "first_access")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"senha":"SenhaForte1!","confirmarSenha":"SenhaForte1!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.primeiroLogin").value(false))
                .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    void patch_primeiro_acesso_deve_rejeitar_senha_sem_requisitos() throws Exception {
        mockMvc.perform(patch("/api/usuarios/1/primeiro-acesso/senha")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt.claim("uid", 1L).claim("purpose", "first_access")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"senha":"fraca","confirmarSenha":"fraca"}
                                """))
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
    void patch_alterar_senha_deve_impedir_alterar_senha_de_outro_usuario() throws Exception {
        String json = """
                {
                  "senhaAtual": "qualquer",
                  "novaSenha": "novaSenha456"
                }
                """;

        mockMvc.perform(patch("/api/usuarios/99/alterar-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.erro").value("Você não tem permissão para esta operação."));
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

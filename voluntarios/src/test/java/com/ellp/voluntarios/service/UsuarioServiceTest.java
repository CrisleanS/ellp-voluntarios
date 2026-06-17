package com.ellp.voluntarios.service;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @InjectMocks
    private UsuarioService service;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .nome("Admin ELLP")
                .email("admin@ellp.com")
                .senha("admin123")
                .tipo("ADMIN")
                .primeiroLogin(true)
                .voluntarioId(null)
                .build();
    }

    // ── login ──

    @Test
    void deve_realizar_login_com_sucesso() {
        when(repository.findByEmail("admin@ellp.com")).thenReturn(Optional.of(usuario));

        Usuario resultado = service.login("admin@ellp.com", "admin123");

        assertNotNull(resultado);
        assertEquals("Admin ELLP", resultado.getNome());
        assertEquals("ADMIN", resultado.getTipo());
        verify(repository).findByEmail("admin@ellp.com");
    }

    @Test
    void deve_lancar_excecao_email_nao_encontrado() {
        when(repository.findByEmail("naoexiste@email.com")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.login("naoexiste@email.com", "qualquer")
        );

        assertTrue(ex.getMessage().contains("E-mail ou senha inválidos"));
    }

    @Test
    void deve_lancar_excecao_senha_incorreta_no_login() {
        when(repository.findByEmail("admin@ellp.com")).thenReturn(Optional.of(usuario));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.login("admin@ellp.com", "senhaErrada")
        );

        assertTrue(ex.getMessage().contains("E-mail ou senha inválidos"));
    }

    // ── alterarSenha ──

    @Test
    void deve_alterar_senha_com_sucesso() {
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = service.alterarSenha(1L, "admin123", "novaSenha456");

        assertEquals("novaSenha456", resultado.getSenha());
        assertFalse(resultado.getPrimeiroLogin());
        verify(repository).save(usuario);
    }

    @Test
    void deve_lancar_excecao_usuario_nao_encontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        RecursoNaoEncontradoException ex = assertThrows(
                RecursoNaoEncontradoException.class,
                () -> service.alterarSenha(99L, "qualquer", "nova")
        );

        assertTrue(ex.getMessage().contains("Usuário não encontrado"));
    }

    @Test
    void deve_lancar_excecao_senha_atual_incorreta() {
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.alterarSenha(1L, "senhaErrada", "novaSenha456")
        );

        assertTrue(ex.getMessage().contains("Senha atual incorreta"));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_lancar_excecao_nova_senha_igual_atual() {
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.alterarSenha(1L, "admin123", "admin123")
        );

        assertTrue(ex.getMessage().contains("nova senha deve ser diferente"));
        verify(repository, never()).save(any());
    }
}

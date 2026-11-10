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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

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
        when(repository.findByEmailIgnoreCase("admin@ellp.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("admin123")).thenReturn("$2a$encoded-admin");

        Usuario resultado = service.login("admin@ellp.com", "admin123");

        assertNotNull(resultado);
        assertEquals("Admin ELLP", resultado.getNome());
        assertEquals("ADMIN", resultado.getTipo());
        verify(repository).findByEmailIgnoreCase("admin@ellp.com");
        assertEquals("$2a$encoded-admin", resultado.getSenha());
    }

    @Test
    void deve_realizar_login_com_senha_bcrypt_existente() {
        usuario.setSenha("$2a$hash-existente");
        when(repository.findByEmailIgnoreCase("admin@ellp.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("admin123", "$2a$hash-existente")).thenReturn(true);

        Usuario resultado = service.login("admin@ellp.com", "admin123");

        assertSame(usuario, resultado);
        verify(passwordEncoder).matches("admin123", "$2a$hash-existente");
        verify(repository, never()).save(any());
    }

    @Test
    void deve_lancar_excecao_email_nao_encontrado() {
        when(repository.findByEmailIgnoreCase("naoexiste@email.com")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.login("naoexiste@email.com", "qualquer")
        );

        assertTrue(ex.getMessage().contains("E-mail ou senha inválidos"));
    }

    @Test
    void deve_lancar_excecao_senha_incorreta_no_login() {
        when(repository.findByEmailIgnoreCase("admin@ellp.com")).thenReturn(Optional.of(usuario));

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
        when(passwordEncoder.encode("novaSenha456")).thenReturn("$2a$encoded-new-password");

        Usuario resultado = service.alterarSenha(1L, "admin123", "novaSenha456");

        assertEquals("$2a$encoded-new-password", resultado.getSenha());
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

    @Test
    void deve_localizar_usuario_pendente_para_primeiro_acesso() {
        usuario.setTipo("VOLUNTARIO");
        when(repository.findByEmailIgnoreCase("admin@ellp.com")).thenReturn(Optional.of(usuario));

        assertEquals(usuario, service.prepararPrimeiroAcesso(" admin@ellp.com "));
    }

    @Test
    void deve_recusar_primeiro_acesso_ja_concluido() {
        usuario.setTipo("VOLUNTARIO");
        usuario.setPrimeiroLogin(false);
        when(repository.findByEmailIgnoreCase("admin@ellp.com")).thenReturn(Optional.of(usuario));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.prepararPrimeiroAcesso("admin@ellp.com")
        );

        assertTrue(exception.getMessage().contains("já concluiu o primeiro acesso"));
    }

    @Test
    void deve_recusar_primeiro_acesso_com_email_nao_cadastrado() {
        when(repository.findByEmailIgnoreCase("naoexiste@email.com")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.prepararPrimeiroAcesso("naoexiste@email.com")
        );

        assertEquals("Usuário não foi cadastrado.", exception.getMessage());
    }

    @Test
    void deve_definir_senha_no_primeiro_acesso_sem_senha_atual() {
        usuario.setTipo("VOLUNTARIO");
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("SenhaForte1!")).thenReturn("$2a$encoded-first-password");
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = service.definirSenhaPrimeiroAcesso(
                1L,
                "SenhaForte1!",
                "SenhaForte1!"
        );

        assertEquals("$2a$encoded-first-password", resultado.getSenha());
        assertFalse(resultado.getPrimeiroLogin());
        verify(repository).save(usuario);
    }

    @Test
    void deve_recusar_senhas_diferentes_no_primeiro_acesso() {
        usuario.setTipo("VOLUNTARIO");
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        assertThrows(
                IllegalArgumentException.class,
                () -> service.definirSenhaPrimeiroAcesso(1L, "SenhaForte1!", "OutraSenha2!")
        );
        verify(repository, never()).save(any());
    }

    @Test
    void deve_recusar_senha_que_ultrapassa_limite_de_bytes_no_primeiro_acesso() {
        usuario.setTipo("VOLUNTARIO");
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));
        String senhaLonga = "á".repeat(37);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.definirSenhaPrimeiroAcesso(1L, senhaLonga, senhaLonga)
        );

        assertTrue(exception.getMessage().contains("72 bytes"));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_impedir_primeiro_acesso_para_conta_admin() {
        when(repository.findByEmailIgnoreCase("admin@ellp.com")).thenReturn(Optional.of(usuario));

        assertThrows(
                IllegalArgumentException.class,
                () -> service.prepararPrimeiroAcesso("admin@ellp.com")
        );
    }
}

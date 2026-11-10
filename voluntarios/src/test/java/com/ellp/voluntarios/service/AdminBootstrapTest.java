package com.ellp.voluntarios.service;

import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminBootstrapTest {

    private UsuarioRepository repository;
    private PasswordEncoder passwordEncoder;
    private AdminBootstrap bootstrap;

    @BeforeEach
    void setUp() {
        repository = mock(UsuarioRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        bootstrap = new AdminBootstrap(repository, passwordEncoder);
        ReflectionTestUtils.setField(bootstrap, "adminEmail", "");
        ReflectionTestUtils.setField(bootstrap, "adminPassword", "");
    }

    @Test
    void deve_ignorar_configuracao_ausente_se_admin_ja_existe() {
        when(repository.existsByTipoIgnoreCase("ADMIN")).thenReturn(true);

        assertDoesNotThrow(() -> bootstrap.run(new DefaultApplicationArguments()));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_exigir_configuracao_se_nao_houver_admin() {
        when(repository.existsByTipoIgnoreCase("ADMIN")).thenReturn(false);

        assertThrows(IllegalStateException.class,
                () -> bootstrap.run(new DefaultApplicationArguments()));
    }

    @Test
    void deve_exigir_email_e_senha_em_conjunto() {
        ReflectionTestUtils.setField(bootstrap, "adminEmail", "admin@example.com");

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> bootstrap.run(new DefaultApplicationArguments()));

        assertTrue(error.getMessage().contains("em conjunto"));
    }

    @Test
    void deve_validar_tamanho_da_senha() {
        ReflectionTestUtils.setField(bootstrap, "adminEmail", "admin@example.com");
        ReflectionTestUtils.setField(bootstrap, "adminPassword", "curta");

        assertThrows(IllegalStateException.class,
                () -> bootstrap.run(new DefaultApplicationArguments()));

        ReflectionTestUtils.setField(bootstrap, "adminPassword", "A".repeat(73));
        assertThrows(IllegalStateException.class,
                () -> bootstrap.run(new DefaultApplicationArguments()));
    }

    @Test
    void deve_nao_criar_admin_se_ja_existe() {
        configurarCredenciais();
        when(repository.existsByTipoIgnoreCase("ADMIN")).thenReturn(true);

        assertDoesNotThrow(() -> bootstrap.run(new DefaultApplicationArguments()));
        verify(repository, never()).existsByEmailIgnoreCase(any());
        verify(repository, never()).save(any());
    }

    @Test
    void deve_recusar_email_ja_usado_por_outra_conta() {
        configurarCredenciais();
        when(repository.existsByTipoIgnoreCase("ADMIN")).thenReturn(false);
        when(repository.existsByEmailIgnoreCase("Admin@Example.com")).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> bootstrap.run(new DefaultApplicationArguments()));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_criar_admin_com_email_normalizado_e_senha_codificada() {
        configurarCredenciais();
        when(repository.existsByTipoIgnoreCase("ADMIN")).thenReturn(false);
        when(repository.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("AdminPassword123!")).thenReturn("hash");

        bootstrap.run(new DefaultApplicationArguments());

        var captor = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(captor.capture());
        assertEquals("admin@example.com", captor.getValue().getEmail());
        assertEquals("hash", captor.getValue().getSenha());
        assertEquals("ADMIN", captor.getValue().getTipo());
        assertTrue(captor.getValue().getPrimeiroLogin());
    }

    private void configurarCredenciais() {
        ReflectionTestUtils.setField(bootstrap, "adminEmail", " Admin@Example.com ");
        ReflectionTestUtils.setField(bootstrap, "adminPassword", "AdminPassword123!");
    }
}

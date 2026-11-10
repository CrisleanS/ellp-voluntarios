package com.ellp.voluntarios.service;

import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email:}")
    private String adminEmail;

    @Value("${app.bootstrap.admin-password:}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail.isBlank() && adminPassword.isBlank()) {
            if (!repository.existsByTipoIgnoreCase("ADMIN")) {
                throw new IllegalStateException(
                        "Nenhum ADMIN existe. Configure APP_ADMIN_EMAIL e APP_ADMIN_PASSWORD para criar o primeiro."
                );
            }
            return;
        }
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            throw new IllegalStateException("Configure APP_ADMIN_EMAIL e APP_ADMIN_PASSWORD em conjunto.");
        }
        if (adminPassword.length() < 12 || adminPassword.length() > 72) {
            throw new IllegalStateException("APP_ADMIN_PASSWORD deve ter entre 12 e 72 caracteres.");
        }
        if (repository.existsByTipoIgnoreCase("ADMIN")) {
            return;
        }
        if (repository.existsByEmailIgnoreCase(adminEmail.trim())) {
            throw new IllegalStateException("O e-mail configurado para o administrador já pertence a outra conta.");
        }

        Usuario admin = new Usuario();
        admin.setNome("Administrador ELLP");
        admin.setEmail(adminEmail.trim().toLowerCase(Locale.ROOT));
        admin.setSenha(passwordEncoder.encode(adminPassword));
        admin.setTipo("ADMIN");
        admin.setPrimeiroLogin(true);
        repository.save(admin);
    }
}

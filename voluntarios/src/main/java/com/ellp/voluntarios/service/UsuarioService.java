package com.ellp.voluntarios.service;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public Usuario login(String email, String senha) {
        Usuario usuario = repository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos."));

        String senhaArmazenada = usuario.getSenha();
        if (!senhaCorreta(senha, senhaArmazenada)) {
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }

        if (!senhaArmazenada.startsWith("$2")) {
            usuario.setSenha(passwordEncoder.encode(senha));
            repository.save(usuario);
        }
        return usuario;
    }

    @Transactional
    public Usuario alterarSenha(Long id, String senhaAtual, String novaSenha) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + id));

        if (!senhaCorreta(senhaAtual, usuario.getSenha())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }

        if (senhaAtual.equals(novaSenha)) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da atual.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setPrimeiroLogin(false);
        return repository.save(usuario);
    }

    public Usuario prepararPrimeiroAcesso(String email) {
        Usuario usuario = repository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("Usuário não foi cadastrado."));

        if (!"VOLUNTARIO".equalsIgnoreCase(usuario.getTipo())) {
            throw new IllegalArgumentException("Primeiro acesso não está disponível para esta conta.");
        }
        if (!Boolean.TRUE.equals(usuario.getPrimeiroLogin())) {
            throw new IllegalArgumentException("Este usuário já concluiu o primeiro acesso. Entre com sua senha.");
        }
        return usuario;
    }

    @Transactional
    public Usuario definirSenhaPrimeiroAcesso(Long id, String senha, String confirmarSenha) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não foi cadastrado."));

        if (!"VOLUNTARIO".equalsIgnoreCase(usuario.getTipo())) {
            throw new IllegalArgumentException("Primeiro acesso não está disponível para esta conta.");
        }
        if (!Boolean.TRUE.equals(usuario.getPrimeiroLogin())) {
            throw new IllegalArgumentException("Este usuário já concluiu o primeiro acesso. Entre com sua senha.");
        }
        if (!senha.equals(confirmarSenha)) {
            throw new IllegalArgumentException("As senhas não coincidem.");
        }
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("A senha ultrapassa o limite seguro de 72 bytes.");
        }

        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setPrimeiroLogin(false);
        return repository.save(usuario);
    }

    private boolean senhaCorreta(String senhaInformada, String senhaArmazenada) {
        if (senhaArmazenada.startsWith("$2")) {
            return passwordEncoder.matches(senhaInformada, senhaArmazenada);
        }
        return MessageDigest.isEqual(
                senhaInformada.getBytes(StandardCharsets.UTF_8),
                senhaArmazenada.getBytes(StandardCharsets.UTF_8)
        );
    }
}
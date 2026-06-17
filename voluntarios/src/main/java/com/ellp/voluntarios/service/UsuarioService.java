package com.ellp.voluntarios.service;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;

    public Usuario login(String email, String senha) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos."));

        if (!usuario.getSenha().equals(senha)) {
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }

        return usuario;
    }

    public Usuario alterarSenha(Long id, String senhaAtual, String novaSenha) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + id));

        if (!usuario.getSenha().equals(senhaAtual)) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }

        if (senhaAtual.equals(novaSenha)) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da atual.");
        }

        usuario.setSenha(novaSenha);
        usuario.setPrimeiroLogin(false);
        return repository.save(usuario);
    }
}
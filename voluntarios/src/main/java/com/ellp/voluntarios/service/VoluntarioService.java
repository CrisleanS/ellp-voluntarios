package com.ellp.voluntarios.service;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Voluntario;
import com.ellp.voluntarios.repository.VoluntarioRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoluntarioService {

    private final VoluntarioRepository repository;
    private final UsuarioRepository usuarioRepository;

    public Voluntario cadastrar(Voluntario voluntario) {

        if (repository.existsByCpf(voluntario.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado: " + voluntario.getCpf());
        }
        
        voluntario.setAtivo(true);
        
        // 2. Salvamos o voluntário e guardamos o retorno numa variável 
        // (pois agora ele tem um ID gerado pelo banco)
        Voluntario voluntarioSalvo = repository.save(voluntario);
        
        // 3. Criamos o usuário atrelado a esse novo voluntário
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(voluntarioSalvo.getNome());
        novoUsuario.setEmail(voluntarioSalvo.getEmail());
        
        // Configura a senha padrão (ex: "123123")
        novoUsuario.setSenha("123");
        
        novoUsuario.setTipo("VOLUNTARIO"); // Define o nível de permissão
        novoUsuario.setPrimeiroLogin(true); // Força a tela de troca de senha no React
        
        novoUsuario.setVoluntarioId(voluntarioSalvo.getId());
        
        // 4. Salva o novo usuário no banco de dados
        usuarioRepository.save(novoUsuario);
        
        // 5. Retorna o voluntário (como o Controller já esperava)
        return voluntarioSalvo;
    }

    public Voluntario editar(Long id, Voluntario dados) {
        Voluntario existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setEmail(dados.getEmail());
        existente.setTelefone(dados.getTelefone());
        existente.setDataNascimento(dados.getDataNascimento());
        existente.setNacionalidade(dados.getNacionalidade());
        existente.setEndereco(dados.getEndereco());
        existente.setCidade(dados.getCidade());
        existente.setEstado(dados.getEstado());
        existente.setEstudanteUtfpr(dados.getEstudanteUtfpr());
        existente.setCurso(dados.getCurso());
        existente.setPeriodo(dados.getPeriodo());
        existente.setRa(dados.getRa());
        existente.setSinteseAtividades(dados.getSinteseAtividades());
        return repository.save(existente);
    }

    public void remover(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }

    public List<Voluntario> listar(Boolean ativo) {
        if (ativo != null) {
            return repository.findByAtivo(ativo);
        }
        return repository.findAll();
    }

    public Voluntario buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Voluntário não encontrado: " + id));
    }

    public Voluntario registrarSaida(Long id, LocalDate dataSaida) {
        Voluntario voluntario = buscarPorId(id);
        voluntario.setDataSaida(dataSaida);
        voluntario.setAtivo(false);
        return repository.save(voluntario);
    }

    public Voluntario reativar(Long id) {
        Voluntario voluntario = buscarPorId(id);

        if (voluntario.getAtivo()) {
            throw new IllegalArgumentException("Voluntário já está ativo.");
        }

        voluntario.setAtivo(true);
        voluntario.setDataSaida(null);
        return repository.save(voluntario);
    }
}

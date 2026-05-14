package com.ellp.voluntarios.service;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Voluntario;
import com.ellp.voluntarios.repository.VoluntarioRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoluntarioService {

    private final VoluntarioRepository repository;

    public Voluntario cadastrar(Voluntario voluntario) {
        if (repository.existsByCpf(voluntario.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado: " + voluntario.getCpf());
        }
        voluntario.setAtivo(true);
        return repository.save(voluntario);
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
}

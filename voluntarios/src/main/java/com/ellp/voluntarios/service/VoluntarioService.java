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
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VoluntarioService {

    private static final Set<String> DDD_VALIDOS = Set.of(
            "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "24",
            "27", "28", "31", "32", "33", "34", "35", "37", "38", "41", "42", "43",
            "44", "45", "46", "47", "48", "49", "51", "53", "54", "55", "61", "62",
            "63", "64", "65", "66", "67", "68", "69", "71", "73", "74", "75", "77",
            "79", "81", "82", "83", "84", "85", "86", "87", "88", "89", "91", "93",
            "94", "95", "96", "97", "98", "99");

    private final VoluntarioRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    @Transactional
    public Voluntario cadastrar(Voluntario voluntario) {
        normalizarCamposPessoais(voluntario);
        validarRegrasDoFormulario(voluntario);
        if (repository.existsByCpfIn(cpfsEquivalentes(voluntario.getCpf()))) {
            throw new IllegalArgumentException("CPF já cadastrado: " + voluntario.getCpf());
        }
        validarEmailDisponivel(voluntario.getEmail(), null);
        
        voluntario.setAtivo(true);
        Voluntario voluntarioSalvo = repository.save(voluntario);

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(voluntarioSalvo.getNome());
        novoUsuario.setEmail(voluntarioSalvo.getEmail());
        novoUsuario.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
        novoUsuario.setTipo("VOLUNTARIO");
        novoUsuario.setPrimeiroLogin(true);
        novoUsuario.setVoluntarioId(voluntarioSalvo.getId());
        usuarioRepository.save(novoUsuario);

        return voluntarioSalvo;
    }

    @Transactional
    public Voluntario editar(Long id, Voluntario dados) {
        Voluntario existente = buscarPorId(id);
        String cpf = dados.getCpf() == null ? existente.getCpf() : normalizarCpf(dados.getCpf());
        dados.setCpf(cpf);
        normalizarCamposPessoais(dados);
        String email = dados.getEmail();
        validarRegrasDoFormulario(dados);
        if (!cpf.equals(existente.getCpf())
                && repository.existsByCpfInAndIdNot(cpfsEquivalentes(cpf), id)) {
            throw new IllegalArgumentException("CPF já cadastrado: " + cpf);
        }
        validarEmailDisponivel(email, id);
        existente.setNome(dados.getNome());
        existente.setCpf(cpf);
        existente.setEmail(email);
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
        Voluntario atualizado = repository.save(existente);
        usuarioRepository.findByVoluntarioId(id).ifPresent(usuario -> {
            usuario.setNome(atualizado.getNome());
            usuario.setEmail(atualizado.getEmail());
            usuarioRepository.save(usuario);
        });
        return atualizado;
    }

    @Transactional
    public void remover(Long id) {
        buscarPorId(id);
        usuarioRepository.deleteByVoluntarioId(id);
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

    private void validarEmailDisponivel(String email, Long voluntarioId) {
        boolean emailEmOutroVoluntario = voluntarioId == null
                ? repository.existsByEmailIgnoreCase(email)
                : repository.existsByEmailIgnoreCaseAndIdNot(email, voluntarioId);
        boolean emailEmOutraConta;
        if (voluntarioId == null) {
            emailEmOutraConta = usuarioRepository.existsByEmailIgnoreCase(email);
        } else {
            emailEmOutraConta = usuarioRepository.findByVoluntarioId(voluntarioId)
                    .map(conta -> usuarioRepository.existsByEmailIgnoreCaseAndIdNot(email, conta.getId()))
                    .orElseGet(() -> usuarioRepository.existsByEmailIgnoreCase(email));
        }
        if (emailEmOutroVoluntario || emailEmOutraConta) {
            throw new IllegalArgumentException("E-mail já cadastrado: " + email);
        }
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void normalizarCamposPessoais(Voluntario voluntario) {
        voluntario.setNome(voluntario.getNome().trim());
        voluntario.setCpf(normalizarCpf(voluntario.getCpf()));
        voluntario.setTelefone(normalizarTelefone(voluntario.getTelefone()));
        voluntario.setEmail(normalizarEmail(voluntario.getEmail()));
        voluntario.setNacionalidade(voluntario.getNacionalidade().trim());
        voluntario.setEndereco(voluntario.getEndereco().trim());
        voluntario.setCidade(voluntario.getCidade().trim());
        voluntario.setEstado(voluntario.getEstado().trim().toUpperCase(Locale.ROOT));
        if (voluntario.getCurso() != null) voluntario.setCurso(voluntario.getCurso().trim());
        if (voluntario.getPeriodo() != null) voluntario.setPeriodo(voluntario.getPeriodo().trim());
        if (voluntario.getRa() != null) voluntario.setRa(voluntario.getRa().trim().toUpperCase(Locale.ROOT));
        if (voluntario.getSinteseAtividades() != null) {
            voluntario.setSinteseAtividades(voluntario.getSinteseAtividades().trim());
        }
    }

    private String normalizarCpf(String cpf) {
        if (cpf == null || !cpf.matches("(?:\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})")) {
            throw new IllegalArgumentException("Informe um CPF válido.");
        }
        String digitos = cpf.replaceAll("\\D", "");
        if (!cpfValido(digitos)) {
            throw new IllegalArgumentException("Informe um CPF válido.");
        }
        return digitos.replaceFirst("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }

    private boolean cpfValido(String cpf) {
        if (cpf.length() != 11 || cpf.matches("(\\d)\\1{10}")) {
            return false;
        }
        for (int posicao = 9; posicao <= 10; posicao++) {
            int soma = 0;
            for (int indice = 0; indice < posicao; indice++) {
                soma += Character.getNumericValue(cpf.charAt(indice)) * (posicao + 1 - indice);
            }
            int resto = (soma * 10) % 11;
            int digito = resto == 10 ? 0 : resto;
            if (digito != Character.getNumericValue(cpf.charAt(posicao))) {
                return false;
            }
        }
        return true;
    }

    private List<String> cpfsEquivalentes(String cpfFormatado) {
        return List.of(cpfFormatado, cpfFormatado.replaceAll("\\D", ""));
    }

    private String normalizarTelefone(String telefone) {
        if (telefone == null || !telefone.matches("[0-9\\s()+.-]+")) {
            throw new IllegalArgumentException("Informe um telefone válido com DDD.");
        }
        String digitos = telefone.replaceAll("\\D", "");
        if ((digitos.length() != 10 && digitos.length() != 11)
                || !DDD_VALIDOS.contains(digitos.substring(0, 2))) {
            throw new IllegalArgumentException("Informe um telefone válido com DDD.");
        }
        int tamanhoPrefixo = digitos.length() == 11 ? 5 : 4;
        return digitos.substring(0, 2) + " "
                + digitos.substring(2, 2 + tamanhoPrefixo) + " "
                + digitos.substring(2 + tamanhoPrefixo);
    }

    private void validarRegrasDoFormulario(Voluntario voluntario) {
        if (voluntario.getDataNascimento() == null
                || !voluntario.getDataNascimento().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Data de nascimento deve ser anterior a hoje.");
        }
        if (voluntario.getDataSaida() != null && voluntario.getDataEntrada() != null
                && voluntario.getDataSaida().isBefore(voluntario.getDataEntrada())) {
            throw new IllegalArgumentException("A data de saída não pode ser anterior à entrada.");
        }
        if (Boolean.TRUE.equals(voluntario.getEstudanteUtfpr())
                && (voluntario.getCurso() == null || voluntario.getCurso().isBlank()
                || voluntario.getPeriodo() == null || voluntario.getPeriodo().isBlank()
                || voluntario.getRa() == null || voluntario.getRa().isBlank()
                || !voluntario.getRa().matches("[A-Za-z0-9.-]{1,30}"))) {
            throw new IllegalArgumentException("Preencha os dados acadêmicos com valores válidos.");
        }
    }

}

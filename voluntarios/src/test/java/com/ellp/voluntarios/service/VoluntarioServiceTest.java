package com.ellp.voluntarios.service;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Voluntario;
import com.ellp.voluntarios.model.Usuario;
import com.ellp.voluntarios.repository.VoluntarioRepository;
import com.ellp.voluntarios.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doNothing;

@ExtendWith(MockitoExtension.class)
class VoluntarioServiceTest {

    @Mock
    private VoluntarioRepository repository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private VoluntarioService service;

    private Voluntario voluntario;

    @BeforeEach
    void setUp() {
        voluntario = Voluntario.builder()
                .id(1L)
                .nome("João Silva")
                .cpf("529.982.247-25")
                .email("joao@email.com")
                .telefone("43 99999 9999")
                .dataNascimento(LocalDate.of(2000, 1, 1))
                .nacionalidade("Brasileira")
                .endereco("Rua A, 100")
                .cidade("Cornélio Procópio")
                .estado("PR")
                .dataEntrada(LocalDate.now())
                .ativo(true)
                .estudanteUtfpr(false)
                .build();
    }

    @Test
    void deve_cadastrar_voluntario_com_sucesso() {
        when(repository.existsByCpfIn(List.of(voluntario.getCpf(), "52998224725"))).thenReturn(false);
        when(repository.existsByEmailIgnoreCase(voluntario.getEmail())).thenReturn(false);
        when(usuarioRepository.existsByEmailIgnoreCase(voluntario.getEmail())).thenReturn(false);
        when(repository.save(any())).thenReturn(voluntario);
        when(passwordEncoder.encode(any())).thenReturn("encoded-password");

        Voluntario resultado = service.cadastrar(voluntario);
        assertNotNull(resultado);
        assertEquals("João Silva", resultado.getNome());
        assertEquals("529.982.247-25", resultado.getCpf());
        assertEquals("43 99999 9999", resultado.getTelefone());
        assertTrue(resultado.getAtivo());
        verify(repository, times(1)).save(voluntario);
        var contaSalva = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(contaSalva.capture());
        assertTrue(contaSalva.getValue().getPrimeiroLogin());
        assertEquals("encoded-password", contaSalva.getValue().getSenha());
    }

    @Test
    void deve_lancar_excecao_cpf_duplicado() {
        when(repository.existsByCpfIn(List.of(voluntario.getCpf(), "52998224725"))).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.cadastrar(voluntario)
        );

        assertTrue(ex.getMessage().contains("CPF já cadastrado"));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_rejeitar_cpf_com_digitos_verificadores_invalidos() {
        voluntario.setCpf("123.456.789-00");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.cadastrar(voluntario)
        );

        assertEquals("Informe um CPF válido.", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void deve_formatar_telefone_ao_cadastrar() {
        voluntario.setTelefone("(43) 99999-9999");
        when(repository.existsByCpfIn(anyList())).thenReturn(false);
        when(repository.existsByEmailIgnoreCase(voluntario.getEmail())).thenReturn(false);
        when(usuarioRepository.existsByEmailIgnoreCase(voluntario.getEmail())).thenReturn(false);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(any())).thenReturn("encoded-password");

        Voluntario resultado = service.cadastrar(voluntario);

        assertEquals("43 99999 9999", resultado.getTelefone());
    }

    @Test
    void deve_rejeitar_telefone_com_ddd_invalido() {
        voluntario.setTelefone("00 99999 9999");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.cadastrar(voluntario)
        );

        assertEquals("Informe um telefone válido com DDD.", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void deve_rejeitar_datas_e_dados_academicos_invalidos_no_servico() {
        voluntario.setDataNascimento(null);
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(voluntario));

        voluntario.setDataNascimento(LocalDate.now().plusDays(1));
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(voluntario));

        voluntario.setDataNascimento(LocalDate.of(2000, 1, 1));
        voluntario.setDataSaida(voluntario.getDataEntrada().minusDays(1));
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(voluntario));

        voluntario.setDataSaida(null);
        voluntario.setEstudanteUtfpr(true);
        voluntario.setCurso(" ");
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(voluntario));

        voluntario.setCurso("Computação");
        voluntario.setPeriodo("1º");
        voluntario.setRa("RA inválido");
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(voluntario));

        verify(repository, never()).save(any());
    }

    @Test
    void deve_rejeitar_cpf_nulo_ou_com_formato_incorreto() {
        voluntario.setCpf(null);
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(voluntario));

        voluntario.setCpf("529 982 247 25");
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(voluntario));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_retornar_apenas_voluntarios_ativos() {
        when(repository.findByAtivo(true)).thenReturn(List.of(voluntario));

        List<Voluntario> resultado = service.listar(true);

        assertEquals(1, resultado.size());
        assertTrue(resultado.get(0).getAtivo());
        verify(repository).findByAtivo(true);
        verify(repository, never()).findAll();
    }

    @Test
    void deve_retornar_apenas_voluntarios_inativos() {
        Voluntario inativo = Voluntario.builder()
                .id(2L)
                .nome("Maria Souza")
                .ativo(false)
                .build();
        when(repository.findByAtivo(false)).thenReturn(List.of(inativo));

        List<Voluntario> resultado = service.listar(false);

        assertEquals(1, resultado.size());
        assertFalse(resultado.get(0).getAtivo());
        verify(repository).findByAtivo(false);
        verify(repository, never()).findAll();
    }

    @Test
    void deve_registrar_data_saida_e_marcar_inativo() {
        LocalDate dataSaida = LocalDate.of(2025, 6, 30);
        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Voluntario resultado = service.registrarSaida(1L, dataSaida);

        assertFalse(resultado.getAtivo());
        assertEquals(dataSaida, resultado.getDataSaida());
        verify(repository).save(voluntario);
    }

    @Test
    void deve_lancar_excecao_para_id_inexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        RecursoNaoEncontradoException ex = assertThrows(
                RecursoNaoEncontradoException.class,
                () -> service.buscarPorId(99L)
        );

        assertTrue(ex.getMessage().contains("Voluntário não encontrado"));
    }

    @Test
    void deve_editar_voluntario_com_sucesso() {
        Voluntario dadosAtualizados = Voluntario.builder()
                .nome("João Editado")
                .email("joao.novo@email.com")
                .telefone("43988888888")
                .dataNascimento(LocalDate.of(2000, 1, 1))
                .nacionalidade("Brasileira")
                .endereco("Rua B, 200")
                .cidade("Cornélio Procópio")
                .estado("PR")
                .estudanteUtfpr(true)
                .curso("Ciência da Computação")
                .periodo("5º")
                .ra("RA123456")
                .sinteseAtividades("Atividades de extensão")
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Voluntario resultado = service.editar(1L, dadosAtualizados);

        assertEquals("João Editado", resultado.getNome());
        assertEquals("joao.novo@email.com", resultado.getEmail());
        assertEquals("Ciência da Computação", resultado.getCurso());
        assertEquals("5º", resultado.getPeriodo());
        assertEquals("RA123456", resultado.getRa());
        assertEquals("Atividades de extensão", resultado.getSinteseAtividades());
        assertTrue(resultado.getEstudanteUtfpr());
        verify(repository).save(voluntario);
    }

    @Test
    void deve_editar_cpf_valido_quando_nao_esta_cadastrado() {
        Voluntario dadosAtualizados = Voluntario.builder()
                .nome("João Editado")
                .cpf("111.444.777-35")
                .email("joao.novo@email.com")
                .telefone("43 98888 8888")
                .dataNascimento(LocalDate.of(2000, 1, 1))
                .nacionalidade("Brasileira")
                .endereco("Rua B, 200")
                .cidade("Cornélio Procópio")
                .estado("PR")
                .estudanteUtfpr(false)
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        when(repository.existsByCpfInAndIdNot(List.of("111.444.777-35", "11144477735"), 1L))
                .thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioRepository.findByVoluntarioId(1L)).thenReturn(Optional.of(Usuario.builder().id(10L).build()));
        when(usuarioRepository.existsByEmailIgnoreCaseAndIdNot("joao.novo@email.com", 10L)).thenReturn(false);

        Voluntario resultado = service.editar(1L, dadosAtualizados);

        assertEquals("111.444.777-35", resultado.getCpf());
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void deve_recusar_cpf_que_ja_pertence_a_outro_voluntario() {
        Voluntario dadosAtualizados = Voluntario.builder()
                .cpf("111.444.777-35")
                .nome("João Editado")
                .email("joao@email.com")
                .telefone("43 99999 9999")
                .dataNascimento(LocalDate.of(2000, 1, 1))
                .nacionalidade("Brasileira")
                .endereco("Rua A, 100")
                .cidade("Cornélio Procópio")
                .estado("PR")
                .estudanteUtfpr(false)
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        when(repository.existsByCpfInAndIdNot(List.of("111.444.777-35", "11144477735"), 1L))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.editar(1L, dadosAtualizados)
        );

        assertTrue(exception.getMessage().contains("CPF já cadastrado"));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_recusar_email_que_ja_pertence_a_outro_voluntario() {
        Voluntario dadosAtualizados = Voluntario.builder()
                .nome("João Editado")
                .email("outro@email.com")
                .telefone("43 99999 9999")
                .dataNascimento(LocalDate.of(2000, 1, 1))
                .nacionalidade("Brasileira")
                .endereco("Rua A, 100")
                .cidade("Cornélio Procópio")
                .estado("PR")
                .estudanteUtfpr(false)
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        when(repository.existsByEmailIgnoreCaseAndIdNot("outro@email.com", 1L)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.editar(1L, dadosAtualizados)
        );

        assertTrue(exception.getMessage().contains("E-mail já cadastrado"));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_remover_voluntario_com_sucesso() {
        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        doNothing().when(repository).deleteById(1L);

        service.remover(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void deve_listar_todos_quando_filtro_nulo() {
        when(repository.findAll()).thenReturn(List.of(voluntario));

        List<Voluntario> resultado = service.listar(null);

        assertEquals(1, resultado.size());
        verify(repository).findAll();
        verify(repository, never()).findByAtivo(any());
    }

    // ── reativar ──

    @Test
    void deve_reativar_voluntario_inativo_com_sucesso() {
        voluntario.setAtivo(false);
        voluntario.setDataSaida(LocalDate.of(2025, 6, 1));

        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Voluntario resultado = service.reativar(1L);

        assertTrue(resultado.getAtivo());
        assertNull(resultado.getDataSaida());
        verify(repository).save(voluntario);
    }

    @Test
    void deve_lancar_excecao_ao_reativar_voluntario_ja_ativo() {
        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.reativar(1L)
        );

        assertTrue(ex.getMessage().contains("já está ativo"));
        verify(repository, never()).save(any());
    }

    @Test
    void deve_lancar_excecao_ao_reativar_id_inexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        RecursoNaoEncontradoException ex = assertThrows(
                RecursoNaoEncontradoException.class,
                () -> service.reativar(99L)
        );

        assertTrue(ex.getMessage().contains("Voluntário não encontrado"));
    }
}

package com.ellp.voluntarios.service;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Voluntario;
import com.ellp.voluntarios.repository.VoluntarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @InjectMocks
    private VoluntarioService service;

    private Voluntario voluntario;

    @BeforeEach
    void setUp() {
        voluntario = Voluntario.builder()
                .id(1L)
                .nome("João Silva")
                .cpf("123.456.789-00")
                .email("joao@email.com")
                .telefone("43999999999")
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
        when(repository.existsByCpf(voluntario.getCpf())).thenReturn(false);
        when(repository.save(any())).thenReturn(voluntario);

        Voluntario resultado = service.cadastrar(voluntario);

        assertNotNull(resultado);
        assertEquals("João Silva", resultado.getNome());
        assertTrue(resultado.getAtivo());
        verify(repository, times(1)).save(voluntario);
    }

    @Test
    void deve_lancar_excecao_cpf_duplicado() {
        when(repository.existsByCpf(voluntario.getCpf())).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.cadastrar(voluntario)
        );

        assertTrue(ex.getMessage().contains("CPF já cadastrado"));
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
                .estudanteUtfpr(false)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(voluntario));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Voluntario resultado = service.editar(1L, dadosAtualizados);

        assertEquals("João Editado", resultado.getNome());
        assertEquals("joao.novo@email.com", resultado.getEmail());
        verify(repository).save(voluntario);
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
}

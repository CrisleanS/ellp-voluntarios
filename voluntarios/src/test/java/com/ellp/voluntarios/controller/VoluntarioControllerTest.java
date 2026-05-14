package com.ellp.voluntarios.controller;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import com.ellp.voluntarios.model.Voluntario;
import com.ellp.voluntarios.service.VoluntarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class VoluntarioControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private VoluntarioService service;

    private MockMvc mockMvc;
    private Voluntario voluntario;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

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
    void post_deve_retornar_201_ao_cadastrar() throws Exception {
        when(service.cadastrar(any())).thenReturn(voluntario);

        String json = """
                {
                  "nome": "João Silva",
                  "cpf": "123.456.789-00",
                  "email": "joao@email.com",
                  "telefone": "43999999999",
                  "dataNascimento": "2000-01-01",
                  "nacionalidade": "Brasileira",
                  "endereco": "Rua A, 100",
                  "cidade": "Cornélio Procópio",
                  "estado": "PR",
                  "dataEntrada": "2024-01-01"
                }
                """;

        mockMvc.perform(post("/api/voluntarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("João Silva"));
    }

    @Test
    void post_deve_retornar_400_com_cpf_em_branco() throws Exception {
        String json = """
                {
                  "nome": "João Silva",
                  "cpf": "",
                  "email": "joao@email.com",
                  "telefone": "43999999999",
                  "dataNascimento": "2000-01-01",
                  "nacionalidade": "Brasileira",
                  "endereco": "Rua A, 100",
                  "cidade": "Cornélio Procópio",
                  "estado": "PR",
                  "dataEntrada": "2024-01-01"
                }
                """;

        mockMvc.perform(post("/api/voluntarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    void get_deve_retornar_200_com_lista_de_ativos() throws Exception {
        when(service.listar(true)).thenReturn(List.of(voluntario));

        mockMvc.perform(get("/api/voluntarios").param("ativo", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("João Silva"))
                .andExpect(jsonPath("$[0].ativo").value(true));
    }

    @Test
    void get_deve_retornar_404_para_id_inexistente() throws Exception {
        when(service.buscarPorId(99L))
                .thenThrow(new RecursoNaoEncontradoException("Voluntário não encontrado: 99"));

        mockMvc.perform(get("/api/voluntarios/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Voluntário não encontrado: 99"));
    }

    @Test
    void put_deve_retornar_200_ao_editar() throws Exception {
        Voluntario atualizado = Voluntario.builder()
                .id(1L)
                .nome("João Silva Editado")
                .cpf("123.456.789-00")
                .email("joao.novo@email.com")
                .telefone("43988888888")
                .dataNascimento(LocalDate.of(2000, 1, 1))
                .nacionalidade("Brasileira")
                .endereco("Rua B, 200")
                .cidade("Cornélio Procópio")
                .estado("PR")
                .dataEntrada(LocalDate.now())
                .ativo(true)
                .estudanteUtfpr(false)
                .build();

        when(service.editar(eq(1L), any())).thenReturn(atualizado);

        String json = """
                {
                  "nome": "João Silva Editado",
                  "cpf": "123.456.789-00",
                  "email": "joao.novo@email.com",
                  "telefone": "43988888888",
                  "dataNascimento": "2000-01-01",
                  "nacionalidade": "Brasileira",
                  "endereco": "Rua B, 200",
                  "cidade": "Cornélio Procópio",
                  "estado": "PR",
                  "dataEntrada": "2024-01-01"
                }
                """;

        mockMvc.perform(put("/api/voluntarios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("João Silva Editado"));
    }

    @Test
    void delete_deve_retornar_204_ao_remover() throws Exception {
        doNothing().when(service).remover(1L);

        mockMvc.perform(delete("/api/voluntarios/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void get_deve_retornar_200_listando_todos_sem_filtro() throws Exception {
        when(service.listar(null)).thenReturn(List.of(voluntario));

        mockMvc.perform(get("/api/voluntarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("João Silva"));
    }

    @Test
    void patch_deve_retornar_200_ao_registrar_saida() throws Exception {
        Voluntario inativo = Voluntario.builder()
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
                .dataSaida(LocalDate.of(2025, 6, 30))
                .ativo(false)
                .estudanteUtfpr(false)
                .build();

        when(service.registrarSaida(eq(1L), any())).thenReturn(inativo);

        mockMvc.perform(patch("/api/voluntarios/1/saida")
                        .param("dataSaida", "2025-06-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false))
                .andExpect(jsonPath("$.dataSaida").value("2025-06-30"));
    }

    @Test
    void post_deve_retornar_400_quando_cpf_duplicado() throws Exception {
        when(service.cadastrar(any()))
                .thenThrow(new IllegalArgumentException("CPF já cadastrado: 123.456.789-00"));

        String json = """
                {
                  "nome": "João Silva",
                  "cpf": "123.456.789-00",
                  "email": "joao@email.com",
                  "telefone": "43999999999",
                  "dataNascimento": "2000-01-01",
                  "nacionalidade": "Brasileira",
                  "endereco": "Rua A, 100",
                  "cidade": "Cornélio Procópio",
                  "estado": "PR",
                  "dataEntrada": "2024-01-01"
                }
                """;

        mockMvc.perform(post("/api/voluntarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("CPF já cadastrado: 123.456.789-00"));
    }
}

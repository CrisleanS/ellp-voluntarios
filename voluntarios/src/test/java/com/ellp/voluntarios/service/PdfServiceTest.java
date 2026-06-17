package com.ellp.voluntarios.service;

import com.ellp.voluntarios.model.Voluntario;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class PdfServiceTest {

    private final PdfService service = new PdfService();

    private Voluntario criarVoluntarioBase() {
        return Voluntario.builder()
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
                .dataEntrada(LocalDate.of(2024, 1, 15))
                .ativo(true)
                .estudanteUtfpr(false)
                .build();
    }

    @Test
    void deve_gerar_pdf_voluntario_sem_vinculo_academico() {
        Voluntario v = criarVoluntarioBase();

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
        // Verifica assinatura PDF (%PDF)
        assertEquals(0x25, pdf[0]); // %
        assertEquals(0x50, pdf[1]); // P
        assertEquals(0x44, pdf[2]); // D
        assertEquals(0x46, pdf[3]); // F
    }

    @Test
    void deve_gerar_pdf_voluntario_com_vinculo_academico() {
        Voluntario v = criarVoluntarioBase();
        v.setEstudanteUtfpr(true);
        v.setCurso("Ciência da Computação");
        v.setPeriodo("5º");
        v.setRa("RA2024001");

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void deve_gerar_pdf_voluntario_inativo_com_data_saida() {
        Voluntario v = criarVoluntarioBase();
        v.setAtivo(false);
        v.setDataSaida(LocalDate.of(2025, 6, 30));

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void deve_gerar_pdf_com_sintese_de_atividades() {
        Voluntario v = criarVoluntarioBase();
        v.setSinteseAtividades("Participou de oficinas de lógica e programação com crianças do ensino fundamental.");

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void deve_gerar_pdf_sem_sintese_de_atividades() {
        Voluntario v = criarVoluntarioBase();
        v.setSinteseAtividades(null);

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void deve_gerar_pdf_com_sintese_em_branco() {
        Voluntario v = criarVoluntarioBase();
        v.setSinteseAtividades("   ");

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void deve_gerar_pdf_voluntario_completo_com_todos_os_campos() {
        Voluntario v = criarVoluntarioBase();
        v.setEstudanteUtfpr(true);
        v.setCurso("Engenharia de Software");
        v.setPeriodo("3º");
        v.setRa("RA2024999");
        v.setSinteseAtividades("Aulas de Scratch e Python para turmas do 6º ano.");
        v.setAtivo(false);
        v.setDataSaida(LocalDate.of(2025, 12, 15));

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void deve_gerar_pdf_sem_data_saida() {
        Voluntario v = criarVoluntarioBase();
        v.setDataSaida(null);

        byte[] pdf = service.gerarTermo(v);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }
}

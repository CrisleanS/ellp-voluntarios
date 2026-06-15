package com.ellp.voluntarios.service;

import com.ellp.voluntarios.model.Voluntario;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] gerarTermo(Voluntario v) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);

            // ── Cabeçalho ──
            doc.add(new Paragraph("UNIVERSIDADE TECNOLÓGICA FEDERAL DO PARANÁ")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBold()
                    .setFontSize(13));

            doc.add(new Paragraph("Câmpus Cornélio Procópio")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(11));

            doc.add(new Paragraph("Projeto ELLP — Ensino Lúdico de Lógica e Programação")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(11)
                    .setMarginBottom(10));

            doc.add(new Paragraph("TERMO DE ADESÃO DE VOLUNTÁRIO")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setBold()
                    .setFontSize(16)
                    .setMarginBottom(20));

            // ── Dados Pessoais ──
            doc.add(secaoTitulo("1. Dados Pessoais"));

            Table dadosPessoais = criarTabela();
            addLinha(dadosPessoais, "Nome completo", v.getNome());
            addLinha(dadosPessoais, "CPF", v.getCpf());
            addLinha(dadosPessoais, "E-mail", v.getEmail());
            addLinha(dadosPessoais, "Telefone", v.getTelefone());
            addLinha(dadosPessoais, "Data de nascimento", formatarData(v.getDataNascimento()));
            addLinha(dadosPessoais, "Nacionalidade", v.getNacionalidade());
            addLinha(dadosPessoais, "Endereço", v.getEndereco());
            addLinha(dadosPessoais, "Cidade", v.getCidade());
            addLinha(dadosPessoais, "Estado", v.getEstado());
            doc.add(dadosPessoais);

            // ── Vínculo Acadêmico ──
            if (Boolean.TRUE.equals(v.getEstudanteUtfpr())) {
                doc.add(secaoTitulo("2. Vínculo Acadêmico — UTFPR"));

                Table dadosAcademicos = criarTabela();
                addLinha(dadosAcademicos, "Curso", v.getCurso());
                addLinha(dadosAcademicos, "Período", v.getPeriodo());
                addLinha(dadosAcademicos, "RA", v.getRa());
                doc.add(dadosAcademicos);
            }

            // ── Participação no Projeto ──
            String secaoNum = Boolean.TRUE.equals(v.getEstudanteUtfpr()) ? "3" : "2";
            doc.add(secaoTitulo(secaoNum + ". Participação no Projeto"));

            Table dadosProjeto = criarTabela();
            addLinha(dadosProjeto, "Data de entrada", formatarData(v.getDataEntrada()));
            addLinha(dadosProjeto, "Data de saída",
                    v.getDataSaida() != null ? formatarData(v.getDataSaida()) : "—");
            addLinha(dadosProjeto, "Status", Boolean.TRUE.equals(v.getAtivo()) ? "Ativo" : "Inativo");
            doc.add(dadosProjeto);

            // ── Síntese de Atividades ──
            String secaoSintese = Boolean.TRUE.equals(v.getEstudanteUtfpr()) ? "4" : "3";
            doc.add(secaoTitulo(secaoSintese + ". Síntese de Atividades"));

            String sintese = v.getSinteseAtividades() != null && !v.getSinteseAtividades().isBlank()
                    ? v.getSinteseAtividades()
                    : "Nenhuma atividade registrada.";
            doc.add(new Paragraph(sintese)
                    .setFontSize(11)
                    .setMarginBottom(20));

            // ── Declaração ──
            String secaoDecl = Boolean.TRUE.equals(v.getEstudanteUtfpr()) ? "5" : "4";
            doc.add(secaoTitulo(secaoDecl + ". Declaração"));

            doc.add(new Paragraph(
                    "Declaro que as informações acima são verdadeiras e que aceito participar "
                  + "voluntariamente do Projeto ELLP — Ensino Lúdico de Lógica e Programação, "
                  + "vinculado à Universidade Tecnológica Federal do Paraná, Câmpus Cornélio Procópio.")
                    .setFontSize(11)
                    .setMarginBottom(30));

            // ── Assinaturas ──
            doc.add(new Paragraph("Cornélio Procópio, ______ de _____________________ de ________.")
                    .setFontSize(11)
                    .setMarginBottom(40));

            doc.add(new Paragraph("_______________________________________________")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(11));

            doc.add(new Paragraph(v.getNome())
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(11));

            doc.add(new Paragraph("Voluntário(a)")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10)
                    .setMarginBottom(30));

            doc.add(new Paragraph("_______________________________________________")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(11));

            doc.add(new Paragraph("Coordenador(a) do Projeto ELLP")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10));

            doc.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do termo: " + e.getMessage(), e);
        }
    }

    // ── Métodos auxiliares ──

    private Paragraph secaoTitulo(String texto) {
        return new Paragraph(texto)
                .setBold()
                .setFontSize(12)
                .setMarginTop(15)
                .setMarginBottom(5);
    }

    private Table criarTabela() {
        Table tabela = new Table(UnitValue.createPercentArray(new float[]{35, 65}));
        tabela.setWidth(UnitValue.createPercentValue(100));
        tabela.setMarginBottom(10);
        return tabela;
    }

    private void addLinha(Table tabela, String campo, String valor) {
        tabela.addCell(new Cell()
                .add(new Paragraph(campo).setBold().setFontSize(10))
                .setPadding(5));
        tabela.addCell(new Cell()
                .add(new Paragraph(valor != null ? valor : "—").setFontSize(10))
                .setPadding(5));
    }

    private String formatarData(java.time.LocalDate data) {
        return data != null ? data.format(FMT) : "—";
    }
}

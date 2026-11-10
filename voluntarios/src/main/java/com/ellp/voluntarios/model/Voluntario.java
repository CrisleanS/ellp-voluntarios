package com.ellp.voluntarios.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "voluntarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voluntario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório.")
    @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres.")
    @Pattern(regexp = "^[\\p{L}\\p{M}][\\p{L}\\p{M} .'-]*$", message = "Nome contém caracteres inválidos.")
    private String nome;

    @NotBlank(message = "CPF é obrigatório.")
    @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres.")
    @Column(unique = true)
    private String cpf;

    @NotBlank(message = "E-mail é obrigatório.")
    @Email(message = "E-mail inválido.")
    @Size(max = 254, message = "E-mail deve ter no máximo 254 caracteres.")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Telefone é obrigatório.")
    @Size(max = 15, message = "Telefone deve ter no máximo 15 caracteres.")
    private String telefone;

    @NotNull
    @Past(message = "Data de nascimento deve ser anterior a hoje.")
    private LocalDate dataNascimento;

    @NotBlank(message = "Nacionalidade é obrigatória.")
    @Size(max = 80, message = "Nacionalidade deve ter no máximo 80 caracteres.")
    private String nacionalidade;

    @NotBlank(message = "Endereço é obrigatório.")
    @Size(max = 200, message = "Endereço deve ter no máximo 200 caracteres.")
    private String endereco;

    @NotBlank(message = "Cidade é obrigatória.")
    @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres.")
    private String cidade;

    @NotBlank(message = "Estado é obrigatório.")
    @Pattern(regexp = "^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$",
            flags = Pattern.Flag.CASE_INSENSITIVE, message = "Informe uma sigla de estado brasileiro válida.")
    private String estado;

    @NotNull
    private LocalDate dataEntrada;

    private LocalDate dataSaida;

    @Builder.Default
    private Boolean ativo = true;

    @Builder.Default
    private Boolean estudanteUtfpr = false;

    // Preenchidos só se estudanteUtfpr = true
    @Size(max = 120, message = "Curso deve ter no máximo 120 caracteres.")
    private String curso;
    @Size(max = 30, message = "Período deve ter no máximo 30 caracteres.")
    private String periodo;
    @Size(max = 30, message = "RA deve ter no máximo 30 caracteres.")
    @Pattern(regexp = "^[A-Za-z0-9.-]*$", message = "RA contém caracteres inválidos.")
    private String ra;

    @Size(max = 5000, message = "Síntese deve ter no máximo 5000 caracteres.")
    @Column(columnDefinition = "TEXT")
    private String sinteseAtividades;
}
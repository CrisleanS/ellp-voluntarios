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

    @NotBlank
    private String nome;

    @NotBlank
    @Column(unique = true)
    private String cpf;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String telefone;

    @NotNull
    private LocalDate dataNascimento;

    @NotBlank
    private String nacionalidade;

    @NotBlank
    private String endereco;

    @NotBlank
    private String cidade;

    @NotBlank
    private String estado;

    @NotNull
    private LocalDate dataEntrada;

    private LocalDate dataSaida;

    private Boolean ativo = true;

    private Boolean estudanteUtfpr = false;

    // Preenchidos só se estudanteUtfpr = true
    private String curso;
    private String periodo;
    private String ra;

    @Column(columnDefinition = "TEXT")
    private String sinteseAtividades;
}
package com.ellp.voluntarios.dto;

import com.ellp.voluntarios.model.Voluntario;

import java.time.LocalDate;

public record VoluntarioResponse(
        Long id,
        String nome,
        String cpf,
        String email,
        String telefone,
        LocalDate dataNascimento,
        String nacionalidade,
        String endereco,
        String cidade,
        String estado,
        LocalDate dataEntrada,
        LocalDate dataSaida,
        Boolean ativo,
        Boolean estudanteUtfpr,
        String curso,
        String periodo,
        String ra,
        String sinteseAtividades
) {
    public static VoluntarioResponse from(Voluntario voluntario) {
        return new VoluntarioResponse(
                voluntario.getId(),
                voluntario.getNome(),
                voluntario.getCpf(),
                voluntario.getEmail(),
                voluntario.getTelefone(),
                voluntario.getDataNascimento(),
                voluntario.getNacionalidade(),
                voluntario.getEndereco(),
                voluntario.getCidade(),
                voluntario.getEstado(),
                voluntario.getDataEntrada(),
                voluntario.getDataSaida(),
                voluntario.getAtivo(),
                voluntario.getEstudanteUtfpr(),
                voluntario.getCurso(),
                voluntario.getPeriodo(),
                voluntario.getRa(),
                voluntario.getSinteseAtividades()
        );
    }
}

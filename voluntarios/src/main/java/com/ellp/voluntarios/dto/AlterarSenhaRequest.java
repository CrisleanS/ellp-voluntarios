package com.ellp.voluntarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AlterarSenhaRequest {

    @NotBlank
    private String senhaAtual;

    @NotBlank
    @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres.")
    private String novaSenha;
}

package com.ellp.voluntarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DefinirSenhaPrimeiroAcessoRequest {

    @NotBlank(message = "Informe uma senha.")
    @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).*$",
            message = "A senha deve conter letra maiúscula, minúscula, número e caractere especial."
    )
    private String senha;

    @NotBlank(message = "Repita a senha.")
    private String confirmarSenha;
}

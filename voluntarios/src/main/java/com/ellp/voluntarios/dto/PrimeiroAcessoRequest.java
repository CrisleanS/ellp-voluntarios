package com.ellp.voluntarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrimeiroAcessoRequest {

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "E-mail inválido.")
    private String email;
}

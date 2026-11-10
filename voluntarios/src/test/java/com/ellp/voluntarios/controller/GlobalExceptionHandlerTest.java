package com.ellp.voluntarios.controller;

import com.ellp.voluntarios.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void deve_converter_recurso_nao_encontrado_em_404() {
        var response = handler.handleNaoEncontrado(new RecursoNaoEncontradoException("Não encontrado"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Não encontrado", response.getBody().get("erro"));
    }

    @Test
    void deve_converter_argumento_invalido_em_400() {
        var response = handler.handleArgumentoInvalido(new IllegalArgumentException("Inválido"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Inválido", response.getBody().get("erro"));
    }

    @Test
    void deve_retornar_primeiro_erro_de_validacao_distinto() {
        var alvo = new Object();
        var binding = new BeanPropertyBindingResult(alvo, "alvo");
        binding.addError(new FieldError("alvo", "nome", "Nome obrigatório."));
        binding.addError(new FieldError("alvo", "email", "Nome obrigatório."));
        binding.addError(new FieldError("alvo", "cpf", "CPF inválido."));
        var exception = new MethodArgumentNotValidException(null, binding);

        var response = handler.handleValidacao(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Nome obrigatório.", response.getBody().get("erro"));
    }

    @Test
    void deve_usar_mensagem_generica_quando_nao_houver_erro_de_campo() {
        var binding = new BeanPropertyBindingResult(new Object(), "alvo");
        var exception = new MethodArgumentNotValidException(null, binding);

        assertEquals("Dados inválidos.", handler.handleValidacao(exception).getBody().get("erro"));
    }

    @Test
    void deve_converter_json_invalido_e_conflito_do_banco() {
        var jsonResponse = handler.handleJsonInvalido(
                new HttpMessageNotReadableException("JSON inválido", mock(org.springframework.http.HttpInputMessage.class)));
        var conflictResponse = handler.handleConflito(new DataIntegrityViolationException("duplicate"));

        assertEquals(HttpStatus.BAD_REQUEST, jsonResponse.getStatusCode());
        assertEquals("Corpo da requisição inválido.", jsonResponse.getBody().get("erro"));
        assertEquals(HttpStatus.CONFLICT, conflictResponse.getStatusCode());
        assertEquals("Os dados informados já estão cadastrados.", conflictResponse.getBody().get("erro"));
    }
}

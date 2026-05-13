package com.ellp.voluntarios.controller;

import com.ellp.voluntarios.model.Voluntario;
import com.ellp.voluntarios.service.VoluntarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/voluntarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VoluntarioController {

    private final VoluntarioService service;

    @GetMapping
    public ResponseEntity<List<Voluntario>> listar(
            @RequestParam(required = false) Boolean ativo) {
        return ResponseEntity.ok(service.listar(ativo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voluntario> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Voluntario> cadastrar(@Valid @RequestBody Voluntario voluntario) {
        return ResponseEntity.status(201).body(service.cadastrar(voluntario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voluntario> editar(
            @PathVariable Long id,
            @Valid @RequestBody Voluntario voluntario) {
        return ResponseEntity.ok(service.editar(id, voluntario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/saida")
    public ResponseEntity<Voluntario> registrarSaida(
            @PathVariable Long id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataSaida) {
        LocalDate data = dataSaida != null ? dataSaida : LocalDate.now();
        return ResponseEntity.ok(service.registrarSaida(id, data));
    }
}
package com.ellp.voluntarios.controller;

import com.ellp.voluntarios.model.Voluntario;
import com.ellp.voluntarios.dto.VoluntarioResponse;
import com.ellp.voluntarios.service.PdfService;
import com.ellp.voluntarios.service.VoluntarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/voluntarios")
@RequiredArgsConstructor
public class VoluntarioController {

    private final VoluntarioService service;
    private final PdfService pdfService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VoluntarioResponse>> listar(
            @RequestParam(required = false) Boolean ativo) {
        return ResponseEntity.ok(service.listar(ativo).stream().map(VoluntarioResponse::from).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@autorizacaoService.podeAcessarVoluntario(authentication, #id)")
    public ResponseEntity<VoluntarioResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(VoluntarioResponse.from(service.buscarPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoluntarioResponse> cadastrar(@Valid @RequestBody Voluntario voluntario) {
        return ResponseEntity.status(201).body(VoluntarioResponse.from(service.cadastrar(voluntario)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoluntarioResponse> editar(
            @PathVariable Long id,
            @Valid @RequestBody Voluntario voluntario) {
        return ResponseEntity.ok(VoluntarioResponse.from(service.editar(id, voluntario)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/saida")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoluntarioResponse> registrarSaida(
            @PathVariable Long id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataSaida) {
        LocalDate data = dataSaida != null ? dataSaida : LocalDate.now();
        return ResponseEntity.ok(VoluntarioResponse.from(service.registrarSaida(id, data)));
    }

    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoluntarioResponse> reativar(@PathVariable Long id) {
        return ResponseEntity.ok(VoluntarioResponse.from(service.reativar(id)));
    }

    @GetMapping("/{id}/termo")
    @PreAuthorize("@autorizacaoService.podeAcessarVoluntario(authentication, #id)")
    public ResponseEntity<byte[]> gerarTermo(@PathVariable Long id) {
        Voluntario voluntario = service.buscarPorId(id);
        byte[] pdf = pdfService.gerarTermo(voluntario);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=termo-voluntario-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

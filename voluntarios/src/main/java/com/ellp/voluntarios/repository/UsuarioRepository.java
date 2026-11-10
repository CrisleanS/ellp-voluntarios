package com.ellp.voluntarios.repository;

import com.ellp.voluntarios.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByEmailIgnoreCase(String email);
    Optional<Usuario> findByVoluntarioId(Long voluntarioId);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    boolean existsByTipoIgnoreCase(String tipo);
    void deleteByVoluntarioId(Long voluntarioId);
}

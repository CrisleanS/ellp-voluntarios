package com.ellp.voluntarios.repository;

import com.ellp.voluntarios.model.Voluntario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoluntarioRepository extends JpaRepository<Voluntario, Long> {
    List<Voluntario> findByAtivo(Boolean ativo);
    boolean existsByCpfIn(List<String> cpfs);
    boolean existsByCpfInAndIdNot(List<String> cpfs, Long id);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
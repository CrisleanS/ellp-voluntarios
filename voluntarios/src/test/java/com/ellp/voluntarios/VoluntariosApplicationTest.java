package com.ellp.voluntarios;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import static org.mockito.Mockito.*;

class VoluntariosApplicationTest {

    @Test
    void deve_iniciar_aplicacao_com_argumentos_recebidos() {
        String[] args = {"--spring.profiles.active=test"};
        try (var springApplication = mockStatic(SpringApplication.class)) {
            springApplication.when(() -> SpringApplication.run(VoluntariosApplication.class, args))
                    .thenReturn(mock(ConfigurableApplicationContext.class));

            VoluntariosApplication.main(args);

            springApplication.verify(() -> SpringApplication.run(VoluntariosApplication.class, args));
        }
    }
}

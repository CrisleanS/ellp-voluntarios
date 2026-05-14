# Sistema de Controle de Voluntários — ELLP

Projeto desenvolvido para a disciplina **ES47C/IF66K — Oficina de Integração 2**  
Prof. Antonio Carlos Fernandes da Silva  
UTFPR — Câmpus Cornélio Procópio

## Descrição

Sistema web para gerenciar o ciclo de vida dos voluntários do projeto de extensão  
**ELLP (Ensino Lúdico de Lógica e Programação)**, desde o cadastro até o desligamento,  
com geração automática do Termo de Adesão para Voluntário(a) em PDF.

## Funcionalidades

- Cadastrar, editar e remover voluntários
- Registrar datas de entrada e saída
- Listar voluntários ativos e inativos
- Gerar o Termo de Adesão em PDF com os dados preenchidos automaticamente

## Arquitetura

O sistema segue a arquitetura de três camadas com frontend e backend separados,
comunicando-se via API REST.

```
┌─────────────────┐        HTTP/REST         ┌──────────────────────────┐
│                 │ ──────────────────────▶ │                          │
│  Frontend       │                         │  Backend                 │
│  React 18+Vite  │ ◀────────────────────── │  Java 21 + Spring Boot 4 │
│                 │        JSON             │                          │
└─────────────────┘                         └────────────┬─────────────┘
                                                         │ JPA/Hibernate
                                                         ▼
                                            ┌──────────────────────────┐
                                            │  Banco de Dados          │
                                            │  PostgreSQL 16           │
                                            └──────────────────────────┘
```

### Estrutura do Backend

```
com.ellp.voluntarios/
├── controller/   VoluntarioController.java · GlobalExceptionHandler.java
├── exception/    RecursoNaoEncontradoException.java
├── service/      VoluntarioService.java · PdfService.java
├── repository/   VoluntarioRepository.java
└── model/        Voluntario.java
```

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + Axios |
| Backend | Java 21 + Spring Boot 4 |
| ORM | Spring Data JPA / Hibernate |
| Banco de Dados | PostgreSQL 16 |
| Geração de PDF | iText 7 |
| Testes | JUnit 5 + Mockito + MockMvc |
| Cobertura | JaCoCo |
| Versionamento | Git + GitHub |
| Kanban | GitHub Projects |

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/voluntarios | Lista todos (param: ?ativo=true/false) |
| GET | /api/voluntarios/{id} | Busca por ID |
| POST | /api/voluntarios | Cadastra novo voluntário |
| PUT | /api/voluntarios/{id} | Atualiza dados |
| DELETE | /api/voluntarios/{id} | Remove voluntário |
| PATCH | /api/voluntarios/{id}/saida | Registra saída |
| GET | /api/voluntarios/{id}/termo | Gera Termo de Adesão em PDF |

## Tratamento de Erros

A API retorna respostas padronizadas para os erros mais comuns:

| Situação | Status HTTP |
|----------|-------------|
| Recurso não encontrado | 404 Not Found |
| CPF já cadastrado | 400 Bad Request |
| Dados inválidos (validação) | 400 Bad Request |

## Estratégia de Testes

Todos os requisitos funcionais possuem cobertura de testes automatizados.  
A meta mínima é **80% de cobertura nas classes de serviço**, monitorada pelo JaCoCo.

### Testes Unitários — `VoluntarioServiceTest` (JUnit 5 + Mockito)
- `deve_cadastrar_voluntario_com_sucesso`
- `deve_lancar_excecao_cpf_duplicado`
- `deve_retornar_apenas_voluntarios_ativos`
- `deve_retornar_apenas_voluntarios_inativos`
- `deve_registrar_data_saida_e_marcar_inativo`
- `deve_lancar_excecao_para_id_inexistente`

### Testes de Integração — `VoluntarioControllerTest` (MockMvc)
- `POST /api/voluntarios` → 201 Created
- `POST /api/voluntarios` com CPF em branco → 400 Bad Request
- `GET /api/voluntarios?ativo=true` → 200 com lista
- `GET /api/voluntarios/{id}` inexistente → 404 Not Found
- `PUT /api/voluntarios/{id}` → 200 atualizado
- `DELETE /api/voluntarios/{id}` → 204 No Content

### Relatório de Cobertura
```bash
mvn test
# Relatório gerado em: target/site/jacoco/index.html
```

## Como executar

### Pré-requisitos
- Java 21+
- PostgreSQL 16+
- Node.js 18+

### Backend
```bash
# 1. Criar o banco de dados
createdb ellp_voluntarios

# 2. Subir o backend (porta 8081)
cd voluntarios
./mvnw spring-boot:run
# API disponível em http://localhost:8081/api
```

### Frontend
```bash
cd ellp-front
npm install
npm run dev
# App disponível em http://localhost:5173
```

## Equipe

| Nome | GitHub |
|------|--------|
| [nome do integrante 1] | [@CrisleanS] |
| [nome do integrante 2] | [@FelipeShirae] |
| [nome do integrante 3] | [@HeitorPF] |

## Requisitos Funcionais

| ID | Descrição |
|----|-----------|
| RF01 | Cadastrar voluntário |
| RF02 | Editar voluntário |
| RF03 | Remover voluntário |
| RF04 | Listar voluntários (com filtro ativo/inativo) |
| RF05 | Registrar saída de voluntário |
| RF06 | Gerar Termo de Voluntariado em PDF |
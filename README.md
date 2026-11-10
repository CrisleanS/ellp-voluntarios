# Sistema de Controle de Voluntários — ELLP

Projeto desenvolvido para a disciplina **ES47C/IF66K — Oficina de Integração 2**  
Prof. Antonio Carlos Fernandes da Silva  
UTFPR — Câmpus Cornélio Procópio

## Descrição

Sistema web para gerenciar o ciclo de vida dos voluntários do projeto de extensão  
**ELLP (Ensino Lúdico de Lógica e Programação)**, desde o cadastro até o desligamento,  
com autenticação por login, controle de permissões (ADMIN/VOLUNTÁRIO) e  
geração automática do Termo de Adesão para Voluntário(a) em PDF.

## Funcionalidades

- **Autenticação** — Login com e-mail e senha, token JWT e senhas armazenadas com BCrypt
- **Autorização na API** — Permissões de ADMIN e VOLUNTARIO verificadas no backend
- **Primeiro acesso sem senha provisória** — Voluntário informa o e-mail cadastrado e define a própria senha
- **Senha forte** — Mínimo de 8 caracteres, maiúscula, minúscula, número e caractere especial
- **Cadastro transacional** — Voluntário e conta de acesso são criados juntos
- **Cadastrar, editar e remover voluntários** — Formulário completo com dados pessoais, acadêmicos e de participação
- **Validação do cadastro** — CPF com dígitos verificadores, telefone brasileiro com DDD, UF e datas; CPF e telefone recebem máscara automática
- **Registrar datas de entrada e saída** — Desativação de voluntários com registro automático de data
- **Reativar voluntários** — Reativação de voluntários inativos com limpeza da data de saída
- **Listar voluntários ativos e inativos** — Com filtro por status e busca por nome/CPF
- **Mensagens de feedback** — Notificações visuais de sucesso e erro nas ações
- **Síntese de atividades** — Campo para registro das atividades realizadas pelo voluntário
- **Gerar Termo de Adesão em PDF** — Download automático com dados preenchidos
- **Navegação por menus** — Menu dinâmico baseado no perfil do usuário
- **Página inicial do voluntário** — Visualização dos próprios dados e geração de PDF

## Arquitetura

O sistema segue a arquitetura de três camadas com frontend e backend separados,
comunicando-se via API REST.

```
┌─────────────────┐        HTTP/REST         ┌──────────────────────────┐
│                 │ ──────────────────────▶ │                          │
│  Frontend       │                         │  Backend                 │
│  React 19+Vite  │ ◀────────────────────── │  Java 21 + Spring Boot 4 │
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
├── config/       SecurityConfig.java
├── controller/   VoluntarioController.java · UsuarioController.java · GlobalExceptionHandler.java
├── dto/          Requests e respostas da API
├── exception/    RecursoNaoEncontradoException.java
├── security/     JwtTokenService.java · AutorizacaoService.java
├── service/      VoluntarioService.java · UsuarioService.java · AdminBootstrap.java · PdfService.java
├── repository/   VoluntarioRepository.java · UsuarioRepository.java
└── model/        Voluntario.java · Usuario.java
```

### Estrutura do Frontend

```
ellp-front/src/
├── api/          client.js · voluntarios.js · usuarios.js
├── components/   Header.jsx · Menu.jsx · Navbar.jsx · PrivateRoute.jsx
├── pages/        Login.jsx · Inicial.jsx · ListagemVoluntarios.jsx · FormularioVoluntario.jsx
└── uteis/        formatarData.js
```

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite 8 + Axios |
| Backend | Java 21 + Spring Boot 4.0.6 |
| Segurança | Spring Security + JWT + BCrypt |
| ORM | Spring Data JPA / Hibernate |
| Banco de Dados | PostgreSQL 16 |
| Geração de PDF | iText 7 |
| Testes | JUnit 5 + Mockito + MockMvc |
| Cobertura | JaCoCo |
| Versionamento | Git + GitHub |
| Kanban | GitHub Projects |

## Endpoints da API

### Voluntários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/voluntarios | Lista todos (param: ?ativo=true/false) |
| GET | /api/voluntarios/{id} | Busca por ID |
| POST | /api/voluntarios | Cadastra voluntário e cria uma conta pendente de primeiro acesso |
| PUT | /api/voluntarios/{id} | Atualiza dados |
| DELETE | /api/voluntarios/{id} | Remove voluntário |
| PATCH | /api/voluntarios/{id}/saida | Registra saída |
| PATCH | /api/voluntarios/{id}/ativar | Reativa voluntário inativo |
| GET | /api/voluntarios/{id}/termo | Gera Termo de Adesão em PDF |

### Usuários

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/usuarios/login | Autentica e retorna token Bearer e perfil do usuário |
| POST | /api/usuarios/primeiro-acesso | Verifica e-mail cadastrado e retorna token temporário válido por 10 minutos |
| PATCH | /api/usuarios/{id}/primeiro-acesso/senha | Define a senha inicial sem pedir senha atual |
| PATCH | /api/usuarios/{id}/alterar-senha | Altera a própria senha autenticada |

Após o login, use o token recebido no cabeçalho `Authorization: Bearer <token>`
nas demais chamadas à API. O token expira conforme `APP_JWT_EXPIRATION_MS`
(8 horas por padrão). A listagem e as operações de cadastro, edição e remoção são
restritas ao ADMIN. Um voluntário autenticado só pode consultar os próprios dados
e gerar o próprio termo. As permissões são verificadas no servidor, não apenas no frontend.

No primeiro acesso de um voluntário, use o e-mail previamente cadastrado por um
ADMIN. O token temporário recebido autoriza somente a definição da senha inicial
e expira em 10 minutos. Depois de cadastrar a senha, o voluntário entra pelo login
normal. O token de sessão é enviado no cabeçalho `Authorization` nas chamadas
protegidas e expira conforme `APP_JWT_EXPIRATION_MS` (8 horas por padrão).

A configuração inicial de senha está disponível somente para contas do perfil
VOLUNTARIO. Como o fluxo solicitado confirma a identidade apenas pelo e-mail,
ele é apropriado para este projeto de estudo; em um sistema real, deve ser
complementado por confirmação de posse da caixa de e-mail.

## Tratamento de Erros

A API retorna respostas padronizadas para os erros mais comuns:

| Situação | Status HTTP |
|----------|-------------|
| Token ausente ou inválido | 401 Unauthorized |
| Perfil sem permissão para a operação | 403 Forbidden |
| Recurso não encontrado | 404 Not Found |
| CPF já cadastrado | 400 Bad Request |
| Dados inválidos (validação) | 400 Bad Request |
| E-mail ou senha inválidos | 400 Bad Request |
| Senha atual incorreta | 400 Bad Request |
| Nova senha igual à atual | 400 Bad Request |
| Voluntário já está ativo | 400 Bad Request |
| Conflito com restrição de unicidade no banco | 409 Conflict |

## Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| ADMIN | Cadastrar, editar, desativar e reativar voluntários. Visualizar listagem completa. Gerar termo de qualquer voluntário. |
| VOLUNTARIO | Visualizar próprios dados. Gerar próprio termo em PDF. |

As rotas da API exigem um token Bearer recebido no login. As operações de administração
são verificadas também no backend; a interface apenas controla a navegação. Senhas são
armazenadas com BCrypt. Contas já existentes com senha em texto simples são migradas
automaticamente para hash quando autenticam com sucesso pela primeira vez.

## Estratégia de Testes

Os fluxos principais possuem testes automatizados. O JaCoCo gera um relatório de
cobertura para acompanhamento; a meta de projeto é **80% nas classes de serviço**.

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
cd voluntarios
.\mvnw.cmd test
# Relatório: target/site/jacoco/index.html
```

## Como executar

### Pré-requisitos
- Java 21+
- PostgreSQL 16+
- Node.js 18+

### Backend
```powershell
# 1. Criar o banco de dados com o PostgreSQL em execução
createdb ellp_voluntarios

# 2. Configurar variáveis de ambiente para este terminal
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:APP_JWT_SECRET = [Convert]::ToBase64String($bytes)
$env:DB_PASSWORD = "senha-do-seu-postgres"

# Necessário somente se o banco ainda não tiver uma conta ADMIN
$env:APP_ADMIN_EMAIL = "admin@seu-dominio"
$env:APP_ADMIN_PASSWORD = Read-Host "Senha do administrador (12 a 72 caracteres)"

# 3. Subir o backend na porta 8081
Set-Location voluntarios
.\mvnw.cmd spring-boot:run
# API disponível em http://localhost:8081/api
```

`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SERVER_PORT`, `APP_JWT_SECRET`,
`APP_JWT_EXPIRATION_MS` e `APP_CORS_ALLOWED_ORIGINS` são configuráveis por
variáveis de ambiente. O segredo JWT deve estar em Base64 e representar no mínimo
32 bytes. Não compartilhe nem versione segredos ou senhas.

Se ainda não houver uma conta ADMIN, configure `APP_ADMIN_EMAIL` e
`APP_ADMIN_PASSWORD` para criar a primeira conta. Ela começa com troca de senha
obrigatória. Se um ADMIN já existir, as variáveis de bootstrap podem ficar sem
configuração; elas não redefinem contas existentes.

### Frontend
```powershell
Set-Location ellp-front
npm install
npm run dev
# App disponível em http://localhost:5173
```
Opcionalmente, configure `VITE_API_URL` (por exemplo, `http://localhost:8081/api`)
no arquivo `.env.local` para apontar o frontend a outra API.

Ao cadastrar um voluntário, a conta fica pendente de primeiro acesso. A pessoa
usa o botão **Primeiro acesso** na tela de login, informa o e-mail previamente
cadastrado e define a própria senha. A tela valida e mostra os requisitos de
senha, a confirmação e os controles para exibir ou ocultar o que está digitando;
não há senha provisória para entregar.

No cadastro de voluntários, o CPF é digitado no formato `000.000.000-00` e
validado pelos dígitos verificadores. Telefones são apresentados como
`11 98456 4658` (ou com quatro dígitos no número local), e o backend persiste
os números normalizados nesse mesmo formato. Datas, UF e campos acadêmicos
também são validados no formulário e no servidor.

## Equipe

| Nome | GitHub |
|------|--------|
| [nome do integrante 1] | [@CrisleanS] |
| [nome do integrante 2] | [@FelipeShirae] |
| [nome do integrante 3] | [@HeitorPF] |

## Requisitos Funcionais

| ID | Descrição | Status |
|----|-----------|--------|
| RF01 | Cadastrar voluntário | ✅ |
| RF02 | Editar voluntário | ✅ |
| RF03 | Remover voluntário | ✅ |
| RF04 | Listar voluntários (com filtro ativo/inativo) | ✅ |
| RF05 | Registrar saída de voluntário | ✅ |
| RF06 | Gerar Termo de Voluntariado em PDF | ✅ |
| RF07 | Autenticação com login (ADMIN/VOLUNTÁRIO) | ✅ |
| RF08 | Navegação por menus com controle de perfil | ✅ |
| RF09 | Busca por nome/CPF na listagem | ✅ |
| RF10 | Síntese de atividades do voluntário | ✅ |
| RF11 | Troca de senha obrigatória no primeiro login | ✅ |
| RF12 | Reativar voluntário inativo | ✅ |

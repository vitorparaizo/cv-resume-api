# 📄 Resume API

REST API completa para um aplicativo de currículo, construída com **Node.js + Express + PostgreSQL**.

---

## 🗂️ Entidades & Relacionamentos

```
profiles (1)
 ├── contacts            (1:N)
 ├── experiences         (1:N)
 │    └── experience_highlights (1:N)
 ├── education           (1:N)
 ├── skill_categories    (1:N)
 │    └── skills         (1:N)
 ├── projects            (1:N)
 │    └── project_technologies (1:N)
 ├── certifications      (1:N)
 └── languages           (1:N)
```

| Entidade                  | Descrição                                          |
|---------------------------|----------------------------------------------------|
| `profiles`                | Perfil principal (nome, headline, resumo, links)   |
| `contacts`                | E-mail, telefone, redes sociais                    |
| `experiences`             | Histórico de empregos/freelas                      |
| `experience_highlights`   | Bullet points de cada experiência                  |
| `education`               | Formação acadêmica e bootcamps                     |
| `skill_categories`        | Categorias de habilidades (Frontend, Backend…)     |
| `skills`                  | Habilidades individuais com nível (1–5)            |
| `projects`                | Projetos pessoais/profissionais com tecnologias    |
| `project_technologies`    | Stack de cada projeto (Node.js, React, etc.)       |
| `certifications`          | Certificações com link de credencial               |
| `languages`               | Idiomas com nível (native, fluent, basic…)         |

---

## 🚀 Rodando com Docker (recomendado)

```bash
git clone <repo>
cd resume-api
docker-compose up --build
```

A API estará disponível em `http://localhost:3000`.  
As migrations e o seed rodam automaticamente.

---

## 🛠️ Rodando manualmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# Criar tabelas
npm run migrate

# Popular com dados de exemplo
npm run seed

# Iniciar servidor
npm start            # produção
npm run dev          # desenvolvimento (nodemon)
```

---

## 📡 Endpoints

Base URL: `http://localhost:3000/api/v1`

### Profiles
| Método | Rota                | Descrição                              |
|--------|---------------------|----------------------------------------|
| GET    | `/profiles`         | Lista todos os perfis                  |
| GET    | `/profiles/:id`     | Retorna perfil completo (resume snapshot) |
| POST   | `/profiles`         | Cria novo perfil                       |
| PUT    | `/profiles/:id`     | Atualiza perfil                        |
| DELETE | `/profiles/:id`     | Remove perfil (cascade)                |

### Contacts
| Método | Rota                                    |
|--------|-----------------------------------------|
| GET    | `/profiles/:profileId/contacts`         |
| GET    | `/profiles/:profileId/contacts/:id`     |
| POST   | `/profiles/:profileId/contacts`         |
| PUT    | `/profiles/:profileId/contacts/:id`     |
| DELETE | `/profiles/:profileId/contacts/:id`     |

### Experiences + Highlights
| Método | Rota                                                              |
|--------|-------------------------------------------------------------------|
| GET    | `/profiles/:profileId/experiences`                                |
| GET    | `/profiles/:profileId/experiences/:id`                            |
| POST   | `/profiles/:profileId/experiences`                                |
| PUT    | `/profiles/:profileId/experiences/:id`                            |
| DELETE | `/profiles/:profileId/experiences/:id`                            |
| POST   | `/profiles/:profileId/experiences/:experienceId/highlights`       |
| PUT    | `/profiles/:profileId/experiences/:experienceId/highlights/:id`   |
| DELETE | `/profiles/:profileId/experiences/:experienceId/highlights/:id`   |

### Education
| Método | Rota                                    |
|--------|-----------------------------------------|
| GET    | `/profiles/:profileId/education`        |
| GET    | `/profiles/:profileId/education/:id`    |
| POST   | `/profiles/:profileId/education`        |
| PUT    | `/profiles/:profileId/education/:id`    |
| DELETE | `/profiles/:profileId/education/:id`    |

### Skill Categories & Skills
| Método | Rota                                                                  |
|--------|-----------------------------------------------------------------------|
| GET    | `/profiles/:profileId/skill-categories`                               |
| POST   | `/profiles/:profileId/skill-categories`                               |
| PUT    | `/profiles/:profileId/skill-categories/:id`                           |
| DELETE | `/profiles/:profileId/skill-categories/:id`                           |
| GET    | `/profiles/:profileId/skill-categories/:categoryId/skills`            |
| POST   | `/profiles/:profileId/skill-categories/:categoryId/skills`            |
| PUT    | `/profiles/:profileId/skill-categories/:categoryId/skills/:skillId`   |
| DELETE | `/profiles/:profileId/skill-categories/:categoryId/skills/:skillId`   |

### Projects
| Método | Rota                                    |
|--------|-----------------------------------------|
| GET    | `/profiles/:profileId/projects`         | (`?featured=true`)
| GET    | `/profiles/:profileId/projects/:id`     |
| POST   | `/profiles/:profileId/projects`         |
| PUT    | `/profiles/:profileId/projects/:id`     |
| DELETE | `/profiles/:profileId/projects/:id`     |

### Certifications
| Método | Rota                                          |
|--------|-----------------------------------------------|
| GET    | `/profiles/:profileId/certifications`         |
| GET    | `/profiles/:profileId/certifications/:id`     |
| POST   | `/profiles/:profileId/certifications`         |
| PUT    | `/profiles/:profileId/certifications/:id`     |
| DELETE | `/profiles/:profileId/certifications/:id`     |

### Languages
| Método | Rota                                     |
|--------|------------------------------------------|
| GET    | `/profiles/:profileId/languages`         |
| GET    | `/profiles/:profileId/languages/:id`     |
| POST   | `/profiles/:profileId/languages`         |
| PUT    | `/profiles/:profileId/languages/:id`     |
| DELETE | `/profiles/:profileId/languages/:id`     |

---

## 📦 Exemplos de Payload

### POST /profiles
```json
{
  "full_name": "Alex Ferreira",
  "headline": "Full-Stack Developer · Node.js · React",
  "summary": "Desenvolvedor com 5 anos de experiência...",
  "location": "Recife, PE",
  "github": "https://github.com/alexferreira",
  "linkedin": "https://linkedin.com/in/alexferreira",
  "available_for_hire": true
}
```

### POST /profiles/:id/experiences
```json
{
  "company": "TechCorp",
  "role": "Senior Developer",
  "location": "Remoto",
  "employment_type": "full-time",
  "start_date": "2022-01-01",
  "is_current": true,
  "highlights": [
    { "description": "Reduzi latência em 40% com migração para microsserviços.", "sort_order": 1 },
    { "description": "Liderei equipe de 5 devs.", "sort_order": 2 }
  ]
}
```

### POST /profiles/:id/projects
```json
{
  "title": "DevLinks",
  "description": "Agregador de links para devs",
  "repo_url": "https://github.com/user/devlinks",
  "status": "wip",
  "is_featured": true,
  "technologies": ["Next.js", "Prisma", "Tailwind CSS"]
}
```

---

## 🧱 Stack
- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Banco de dados**: PostgreSQL 15
- **Validação**: express-validator
- **Segurança**: helmet, cors
- **Container**: Docker + Docker Compose

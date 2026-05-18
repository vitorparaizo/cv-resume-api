const { pool } = require('../config/database');
require('dotenv').config();

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🌱 Seeding database...');

    // 1. Profile
    const { rows: [profile] } = await client.query(`
      INSERT INTO profiles (full_name, headline, summary, location, website, linkedin, github, available_for_hire)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
    `, [
      'Alex Ferreira',
      'Full-Stack Developer · Node.js · React · PostgreSQL',
      'Desenvolvedor full-stack com 5+ anos de experiência construindo APIs escaláveis e interfaces modernas. Apaixonado por código limpo, arquitetura de software e open-source.',
      'Recife, PE — Brasil',
      'https://alexferreira.dev',
      'https://linkedin.com/in/alexferreira',
      'https://github.com/alexferreira',
      true
    ]);
    const profileId = profile.id;

    // 2. Contacts
    await client.query(`
      INSERT INTO contacts (profile_id, type, label, value, is_primary) VALUES
      ($1, 'email',   'E-mail',    'alex@alexferreira.dev', true),
      ($1, 'phone',   'Telefone',  '+55 81 99999-0000',     false),
      ($1, 'twitter', 'Twitter',   '@alexferreira',         false)
    `, [profileId]);

    // 3. Experiences
    const { rows: [exp1] } = await client.query(`
      INSERT INTO experiences (profile_id, company, role, location, employment_type, description, start_date, is_current, company_url, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id
    `, [
      profileId, 'TechCorp Brasil', 'Senior Full-Stack Developer',
      'Recife, PE', 'full-time',
      'Liderança técnica de um squad de 5 devs na construção de uma plataforma SaaS B2B.',
      '2021-03-01', true, 'https://techcorp.com.br', 1
    ]);

    await client.query(`
      INSERT INTO experience_highlights (experience_id, description, sort_order) VALUES
      ($1, 'Arquitetei migração de monolito para microsserviços com Node.js + RabbitMQ, reduzindo latência em 40%.', 1),
      ($1, 'Implementei CI/CD com GitHub Actions + Docker, diminuindo tempo de deploy de 45min para 8min.', 2),
      ($1, 'Mentorei 3 desenvolvedores júnior e conduzi code reviews semanais.', 3)
    `, [exp1.id]);

    const { rows: [exp2] } = await client.query(`
      INSERT INTO experiences (profile_id, company, role, location, employment_type, description, start_date, end_date, is_current, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id
    `, [
      profileId, 'StartupXYZ', 'Full-Stack Developer',
      'Remoto', 'full-time',
      'Desenvolvimento de marketplace de cursos online do zero ao produto em produção.',
      '2019-06-01', '2021-02-28', false, 2
    ]);

    await client.query(`
      INSERT INTO experience_highlights (experience_id, description, sort_order) VALUES
      ($1, 'Construí API REST com Node.js + PostgreSQL servindo 50k usuários mensais.', 1),
      ($1, 'Desenvolvi frontend em React com SSR via Next.js.', 2),
      ($1, 'Integrei gateway de pagamento (Stripe + Pagar.me) processando R$200k/mês.', 3)
    `, [exp2.id]);

    // 4. Education
    await client.query(`
      INSERT INTO education (profile_id, institution, degree, field_of_study, start_date, end_date, sort_order)
      VALUES
      ($1, 'UFPE - Universidade Federal de Pernambuco', 'Bacharelado', 'Ciência da Computação', '2014-03-01', '2018-12-01', 1),
      ($1, 'Rocketseat', 'Bootcamp', 'Ignite Node.js & React', '2021-01-01', '2021-06-01', 2)
    `, [profileId]);

    // 5. Skill Categories + Skills
    const { rows: [catFront] } = await client.query(`
      INSERT INTO skill_categories (profile_id, name, sort_order) VALUES ($1,'Frontend',1) RETURNING id
    `, [profileId]);
    const { rows: [catBack] } = await client.query(`
      INSERT INTO skill_categories (profile_id, name, sort_order) VALUES ($1,'Backend',2) RETURNING id
    `, [profileId]);
    const { rows: [catDevOps] } = await client.query(`
      INSERT INTO skill_categories (profile_id, name, sort_order) VALUES ($1,'DevOps & Cloud',3) RETURNING id
    `, [profileId]);

    await client.query(`
      INSERT INTO skills (category_id, name, level, years_exp, sort_order) VALUES
      ($1,'React',      5, 5.0, 1), ($1,'Next.js',    4, 3.0, 2),
      ($1,'TypeScript', 5, 4.0, 3), ($1,'Tailwind CSS',4, 2.0, 4)
    `, [catFront.id]);

    await client.query(`
      INSERT INTO skills (category_id, name, level, years_exp, sort_order) VALUES
      ($1,'Node.js',    5, 5.0, 1), ($1,'PostgreSQL', 5, 5.0, 2),
      ($1,'Express',    5, 5.0, 3), ($1,'Redis',      3, 2.0, 4),
      ($1,'RabbitMQ',   3, 2.0, 5)
    `, [catBack.id]);

    await client.query(`
      INSERT INTO skills (category_id, name, level, years_exp, sort_order) VALUES
      ($1,'Docker',     4, 3.0, 1), ($1,'GitHub Actions',4,3.0,2),
      ($1,'AWS (EC2/S3/RDS)',3,2.0,3)
    `, [catDevOps.id]);

    // 6. Projects
    const { rows: [proj1] } = await client.query(`
      INSERT INTO projects (profile_id, title, description, repo_url, live_url, status, is_featured, start_date, end_date, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id
    `, [
      profileId,
      'Resume API',
      'API REST completa para aplicativo de currículo com Express + PostgreSQL. CRUD para todas as seções do currículo.',
      'https://github.com/alexferreira/resume-api',
      'https://resume-api.alexferreira.dev',
      'completed', true, '2024-01-01', '2024-02-01', 1
    ]);
    await client.query(`
      INSERT INTO project_technologies (project_id, name) VALUES
      ($1,'Node.js'),($1,'Express'),($1,'PostgreSQL'),($1,'Docker')
    `, [proj1.id]);

    const { rows: [proj2] } = await client.query(`
      INSERT INTO projects (profile_id, title, description, repo_url, status, is_featured, start_date, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
    `, [
      profileId,
      'DevLinks',
      'Agregador de links para desenvolvedores. Clone do Linktree com autenticação e temas customizáveis.',
      'https://github.com/alexferreira/devlinks',
      'wip', true, '2024-03-01', 2
    ]);
    await client.query(`
      INSERT INTO project_technologies (project_id, name) VALUES
      ($1,'Next.js'),($1,'Prisma'),($1,'Tailwind CSS'),($1,'Vercel')
    `, [proj2.id]);

    // 7. Certifications
    await client.query(`
      INSERT INTO certifications (profile_id, title, issuing_org, issue_date, credential_url, sort_order)
      VALUES
      ($1,'AWS Certified Developer – Associate','Amazon Web Services','2023-05-01','https://aws.amazon.com/verify/abc123',1),
      ($1,'Node.js Application Developer (JSNAD)','OpenJS Foundation','2022-11-01','https://nodejs.org/cert/xyz789',2)
    `, [profileId]);

    // 8. Languages
    await client.query(`
      INSERT INTO languages (profile_id, name, proficiency, sort_order) VALUES
      ($1,'Português','native',1),
      ($1,'Inglês',   'fluent', 2),
      ($1,'Espanhol', 'basic',  3)
    `, [profileId]);

    await client.query('COMMIT');
    console.log(`✅ Seed completed! Profile ID: ${profileId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

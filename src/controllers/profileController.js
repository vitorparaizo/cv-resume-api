const db = require('../config/database');

// GET /profiles
const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM profiles ORDER BY created_at DESC`
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

// GET /profiles/:id  (full resume snapshot)
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows: [profile] } = await db.query(
      `SELECT * FROM profiles WHERE id = $1`, [id]
    );
    if (!profile) return next({ status: 404, message: 'Profile not found' });

    const [contacts, experiences, education, skillCats, projects, certs, languages] =
      await Promise.all([
        db.query(`SELECT * FROM contacts WHERE profile_id=$1 ORDER BY is_primary DESC`, [id]),
        db.query(`SELECT * FROM experiences WHERE profile_id=$1 ORDER BY sort_order, start_date DESC`, [id]),
        db.query(`SELECT * FROM education WHERE profile_id=$1 ORDER BY sort_order, start_date DESC`, [id]),
        db.query(`SELECT sc.*, json_agg(s.* ORDER BY s.sort_order) FILTER (WHERE s.id IS NOT NULL) AS skills
                  FROM skill_categories sc
                  LEFT JOIN skills s ON s.category_id = sc.id
                  WHERE sc.profile_id=$1
                  GROUP BY sc.id ORDER BY sc.sort_order`, [id]),
        db.query(`SELECT p.*, json_agg(pt.name) FILTER (WHERE pt.id IS NOT NULL) AS technologies
                  FROM projects p
                  LEFT JOIN project_technologies pt ON pt.project_id = p.id
                  WHERE p.profile_id=$1
                  GROUP BY p.id ORDER BY p.sort_order`, [id]),
        db.query(`SELECT * FROM certifications WHERE profile_id=$1 ORDER BY sort_order, issue_date DESC`, [id]),
        db.query(`SELECT * FROM languages WHERE profile_id=$1 ORDER BY sort_order`, [id]),
      ]);

    // Attach highlights to each experience
    const expIds = experiences.rows.map(e => e.id);
    let highlights = { rows: [] };
    if (expIds.length) {
      highlights = await db.query(
        `SELECT * FROM experience_highlights WHERE experience_id = ANY($1) ORDER BY sort_order`,
        [expIds]
      );
    }
    const hlMap = highlights.rows.reduce((acc, h) => {
      (acc[h.experience_id] = acc[h.experience_id] || []).push(h);
      return acc;
    }, {});

    const enrichedExps = experiences.rows.map(e => ({
      ...e,
      highlights: hlMap[e.id] || [],
    }));

    res.json({
      status: 'success',
      data: {
        ...profile,
        contacts: contacts.rows,
        experiences: enrichedExps,
        education: education.rows,
        skill_categories: skillCats.rows,
        projects: projects.rows,
        certifications: certs.rows,
        languages: languages.rows,
      },
    });
  } catch (err) { next(err); }
};

// POST /profiles
const create = async (req, res, next) => {
  try {
    const {
      full_name, headline, summary, avatar_url,
      location, website, linkedin, github, available_for_hire,
    } = req.body;

    const { rows: [profile] } = await db.query(
      `INSERT INTO profiles
         (full_name, headline, summary, avatar_url, location, website, linkedin, github, available_for_hire)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [full_name, headline, summary, avatar_url, location, website, linkedin, github, available_for_hire]
    );
    res.status(201).json({ status: 'success', data: profile });
  } catch (err) { next(err); }
};

// PUT /profiles/:id
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      full_name, headline, summary, avatar_url,
      location, website, linkedin, github, available_for_hire,
    } = req.body;

    const { rows: [profile] } = await db.query(
      `UPDATE profiles SET
         full_name=$1, headline=$2, summary=$3, avatar_url=$4,
         location=$5, website=$6, linkedin=$7, github=$8, available_for_hire=$9
       WHERE id=$10 RETURNING *`,
      [full_name, headline, summary, avatar_url, location, website, linkedin, github, available_for_hire, id]
    );
    if (!profile) return next({ status: 404, message: 'Profile not found' });
    res.json({ status: 'success', data: profile });
  } catch (err) { next(err); }
};

// DELETE /profiles/:id
const remove = async (req, res, next) => {
  try {
    const { rows: [profile] } = await db.query(
      `DELETE FROM profiles WHERE id=$1 RETURNING id`, [req.params.id]
    );
    if (!profile) return next({ status: 404, message: 'Profile not found' });
    res.json({ status: 'success', message: 'Profile deleted', id: profile.id });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };

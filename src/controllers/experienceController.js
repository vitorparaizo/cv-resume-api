const db = require('../config/database');

// GET /profiles/:profileId/experiences
const getAll = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { rows } = await db.query(
      `SELECT e.*,
         COALESCE(json_agg(h.* ORDER BY h.sort_order) FILTER (WHERE h.id IS NOT NULL), '[]') AS highlights
       FROM experiences e
       LEFT JOIN experience_highlights h ON h.experience_id = e.id
       WHERE e.profile_id = $1
       GROUP BY e.id
       ORDER BY e.sort_order, e.start_date DESC`,
      [profileId]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

// GET /profiles/:profileId/experiences/:id
const getById = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const { rows: [exp] } = await db.query(
      `SELECT e.*,
         COALESCE(json_agg(h.* ORDER BY h.sort_order) FILTER (WHERE h.id IS NOT NULL), '[]') AS highlights
       FROM experiences e
       LEFT JOIN experience_highlights h ON h.experience_id = e.id
       WHERE e.id=$1 AND e.profile_id=$2
       GROUP BY e.id`,
      [id, profileId]
    );
    if (!exp) return next({ status: 404, message: 'Experience not found' });
    res.json({ status: 'success', data: exp });
  } catch (err) { next(err); }
};

// POST /profiles/:profileId/experiences
const create = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const {
      company, role, location, employment_type, description,
      start_date, end_date, is_current, company_url, sort_order, highlights = [],
    } = req.body;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows: [exp] } = await client.query(
        `INSERT INTO experiences
           (profile_id,company,role,location,employment_type,description,start_date,end_date,is_current,company_url,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [profileId, company, role, location, employment_type, description, start_date, end_date, is_current, company_url, sort_order || 0]
      );

      const insertedHighlights = [];
      for (let i = 0; i < highlights.length; i++) {
        const { rows: [h] } = await client.query(
          `INSERT INTO experience_highlights (experience_id, description, sort_order)
           VALUES ($1,$2,$3) RETURNING *`,
          [exp.id, highlights[i].description, highlights[i].sort_order ?? i + 1]
        );
        insertedHighlights.push(h);
      }

      await client.query('COMMIT');
      res.status(201).json({ status: 'success', data: { ...exp, highlights: insertedHighlights } });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
};

// PUT /profiles/:profileId/experiences/:id
const update = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const {
      company, role, location, employment_type, description,
      start_date, end_date, is_current, company_url, sort_order,
    } = req.body;

    const { rows: [exp] } = await db.query(
      `UPDATE experiences SET
         company=$1,role=$2,location=$3,employment_type=$4,description=$5,
         start_date=$6,end_date=$7,is_current=$8,company_url=$9,sort_order=$10
       WHERE id=$11 AND profile_id=$12 RETURNING *`,
      [company, role, location, employment_type, description, start_date, end_date, is_current, company_url, sort_order, id, profileId]
    );
    if (!exp) return next({ status: 404, message: 'Experience not found' });
    res.json({ status: 'success', data: exp });
  } catch (err) { next(err); }
};

// DELETE /profiles/:profileId/experiences/:id
const remove = async (req, res, next) => {
  try {
    const { rows: [exp] } = await db.query(
      `DELETE FROM experiences WHERE id=$1 AND profile_id=$2 RETURNING id`,
      [req.params.id, req.params.profileId]
    );
    if (!exp) return next({ status: 404, message: 'Experience not found' });
    res.json({ status: 'success', message: 'Experience deleted', id: exp.id });
  } catch (err) { next(err); }
};

// ---- Highlights sub-resource ----

// POST /profiles/:profileId/experiences/:experienceId/highlights
const addHighlight = async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const { description, sort_order } = req.body;
    const { rows: [h] } = await db.query(
      `INSERT INTO experience_highlights (experience_id, description, sort_order)
       VALUES ($1,$2,$3) RETURNING *`,
      [experienceId, description, sort_order || 0]
    );
    res.status(201).json({ status: 'success', data: h });
  } catch (err) { next(err); }
};

// PUT /profiles/:profileId/experiences/:experienceId/highlights/:id
const updateHighlight = async (req, res, next) => {
  try {
    const { experienceId, id } = req.params;
    const { description, sort_order } = req.body;
    const { rows: [h] } = await db.query(
      `UPDATE experience_highlights SET description=$1, sort_order=$2
       WHERE id=$3 AND experience_id=$4 RETURNING *`,
      [description, sort_order, id, experienceId]
    );
    if (!h) return next({ status: 404, message: 'Highlight not found' });
    res.json({ status: 'success', data: h });
  } catch (err) { next(err); }
};

// DELETE /profiles/:profileId/experiences/:experienceId/highlights/:id
const removeHighlight = async (req, res, next) => {
  try {
    const { experienceId, id } = req.params;
    const { rows: [h] } = await db.query(
      `DELETE FROM experience_highlights WHERE id=$1 AND experience_id=$2 RETURNING id`,
      [id, experienceId]
    );
    if (!h) return next({ status: 404, message: 'Highlight not found' });
    res.json({ status: 'success', message: 'Highlight deleted', id: h.id });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, addHighlight, updateHighlight, removeHighlight };

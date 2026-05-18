const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const { featured } = req.query;
    let sql = `
      SELECT p.*,
        COALESCE(json_agg(pt.name) FILTER (WHERE pt.id IS NOT NULL), '[]') AS technologies
      FROM projects p
      LEFT JOIN project_technologies pt ON pt.project_id = p.id
      WHERE p.profile_id = $1`;
    const params = [req.params.profileId];
    if (featured === 'true') { sql += ` AND p.is_featured = true`; }
    sql += ` GROUP BY p.id ORDER BY p.sort_order`;
    const { rows } = await db.query(sql, params);
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows: [project] } = await db.query(
      `SELECT p.*,
         COALESCE(json_agg(pt.name) FILTER (WHERE pt.id IS NOT NULL), '[]') AS technologies
       FROM projects p
       LEFT JOIN project_technologies pt ON pt.project_id = p.id
       WHERE p.id=$1 AND p.profile_id=$2
       GROUP BY p.id`,
      [req.params.id, req.params.profileId]
    );
    if (!project) return next({ status: 404, message: 'Project not found' });
    res.json({ status: 'success', data: project });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const {
      title, description, repo_url, live_url, thumbnail_url,
      status, is_featured, start_date, end_date, sort_order, technologies = [],
    } = req.body;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const { rows: [project] } = await client.query(
        `INSERT INTO projects (profile_id,title,description,repo_url,live_url,thumbnail_url,status,is_featured,start_date,end_date,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [profileId, title, description, repo_url, live_url, thumbnail_url, status || 'completed', is_featured, start_date, end_date, sort_order || 0]
      );

      for (const tech of technologies) {
        await client.query(
          `INSERT INTO project_technologies (project_id, name) VALUES ($1,$2)`,
          [project.id, tech]
        );
      }
      await client.query('COMMIT');
      res.status(201).json({ status: 'success', data: { ...project, technologies } });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const {
      title, description, repo_url, live_url, thumbnail_url,
      status, is_featured, start_date, end_date, sort_order, technologies,
    } = req.body;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const { rows: [project] } = await client.query(
        `UPDATE projects SET title=$1,description=$2,repo_url=$3,live_url=$4,thumbnail_url=$5,
           status=$6,is_featured=$7,start_date=$8,end_date=$9,sort_order=$10
         WHERE id=$11 AND profile_id=$12 RETURNING *`,
        [title, description, repo_url, live_url, thumbnail_url, status, is_featured, start_date, end_date, sort_order, id, profileId]
      );
      if (!project) { await client.query('ROLLBACK'); return next({ status: 404, message: 'Project not found' }); }

      if (Array.isArray(technologies)) {
        await client.query(`DELETE FROM project_technologies WHERE project_id=$1`, [id]);
        for (const tech of technologies) {
          await client.query(`INSERT INTO project_technologies (project_id, name) VALUES ($1,$2)`, [id, tech]);
        }
      }
      await client.query('COMMIT');
      res.json({ status: 'success', data: { ...project, technologies: technologies || [] } });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows: [project] } = await db.query(
      `DELETE FROM projects WHERE id=$1 AND profile_id=$2 RETURNING id`,
      [req.params.id, req.params.profileId]
    );
    if (!project) return next({ status: 404, message: 'Project not found' });
    res.json({ status: 'success', message: 'Project deleted', id: project.id });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };

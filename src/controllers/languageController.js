const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM languages WHERE profile_id=$1 ORDER BY sort_order`,
      [req.params.profileId]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows: [lang] } = await db.query(
      `SELECT * FROM languages WHERE id=$1 AND profile_id=$2`,
      [req.params.id, req.params.profileId]
    );
    if (!lang) return next({ status: 404, message: 'Language not found' });
    res.json({ status: 'success', data: lang });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, proficiency, sort_order } = req.body;
    const { rows: [lang] } = await db.query(
      `INSERT INTO languages (profile_id, name, proficiency, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.profileId, name, proficiency || 'intermediate', sort_order || 0]
    );
    res.status(201).json({ status: 'success', data: lang });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const { name, proficiency, sort_order } = req.body;
    const { rows: [lang] } = await db.query(
      `UPDATE languages SET name=$1, proficiency=$2, sort_order=$3 WHERE id=$4 AND profile_id=$5 RETURNING *`,
      [name, proficiency, sort_order, id, profileId]
    );
    if (!lang) return next({ status: 404, message: 'Language not found' });
    res.json({ status: 'success', data: lang });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows: [lang] } = await db.query(
      `DELETE FROM languages WHERE id=$1 AND profile_id=$2 RETURNING id`,
      [req.params.id, req.params.profileId]
    );
    if (!lang) return next({ status: 404, message: 'Language not found' });
    res.json({ status: 'success', message: 'Language deleted', id: lang.id });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };

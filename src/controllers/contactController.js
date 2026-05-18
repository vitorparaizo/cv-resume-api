const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM contacts WHERE profile_id=$1 ORDER BY is_primary DESC, created_at`,
      [req.params.profileId]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows: [contact] } = await db.query(
      `SELECT * FROM contacts WHERE id=$1 AND profile_id=$2`,
      [req.params.id, req.params.profileId]
    );
    if (!contact) return next({ status: 404, message: 'Contact not found' });
    res.json({ status: 'success', data: contact });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { type, label, value, is_primary } = req.body;
    const { rows: [contact] } = await db.query(
      `INSERT INTO contacts (profile_id, type, label, value, is_primary) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.profileId, type, label, value, is_primary || false]
    );
    res.status(201).json({ status: 'success', data: contact });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const { type, label, value, is_primary } = req.body;
    const { rows: [contact] } = await db.query(
      `UPDATE contacts SET type=$1, label=$2, value=$3, is_primary=$4 WHERE id=$5 AND profile_id=$6 RETURNING *`,
      [type, label, value, is_primary, id, profileId]
    );
    if (!contact) return next({ status: 404, message: 'Contact not found' });
    res.json({ status: 'success', data: contact });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows: [contact] } = await db.query(
      `DELETE FROM contacts WHERE id=$1 AND profile_id=$2 RETURNING id`,
      [req.params.id, req.params.profileId]
    );
    if (!contact) return next({ status: 404, message: 'Contact not found' });
    res.json({ status: 'success', message: 'Contact deleted', id: contact.id });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };

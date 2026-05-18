const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM certifications WHERE profile_id=$1 ORDER BY sort_order, issue_date DESC`,
      [req.params.profileId]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows: [cert] } = await db.query(
      `SELECT * FROM certifications WHERE id=$1 AND profile_id=$2`,
      [req.params.id, req.params.profileId]
    );
    if (!cert) return next({ status: 404, message: 'Certification not found' });
    res.json({ status: 'success', data: cert });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { title, issuing_org, issue_date, expiry_date, credential_id, credential_url, sort_order } = req.body;
    const { rows: [cert] } = await db.query(
      `INSERT INTO certifications (profile_id,title,issuing_org,issue_date,expiry_date,credential_id,credential_url,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.profileId, title, issuing_org, issue_date, expiry_date, credential_id, credential_url, sort_order || 0]
    );
    res.status(201).json({ status: 'success', data: cert });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const { title, issuing_org, issue_date, expiry_date, credential_id, credential_url, sort_order } = req.body;
    const { rows: [cert] } = await db.query(
      `UPDATE certifications SET title=$1,issuing_org=$2,issue_date=$3,expiry_date=$4,
         credential_id=$5,credential_url=$6,sort_order=$7
       WHERE id=$8 AND profile_id=$9 RETURNING *`,
      [title, issuing_org, issue_date, expiry_date, credential_id, credential_url, sort_order, id, profileId]
    );
    if (!cert) return next({ status: 404, message: 'Certification not found' });
    res.json({ status: 'success', data: cert });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows: [cert] } = await db.query(
      `DELETE FROM certifications WHERE id=$1 AND profile_id=$2 RETURNING id`,
      [req.params.id, req.params.profileId]
    );
    if (!cert) return next({ status: 404, message: 'Certification not found' });
    res.json({ status: 'success', message: 'Certification deleted', id: cert.id });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };

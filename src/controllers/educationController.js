const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM education WHERE profile_id=$1 ORDER BY sort_order, start_date DESC`,
      [req.params.profileId]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const { rows: [edu] } = await db.query(
      `SELECT * FROM education WHERE id=$1 AND profile_id=$2`,
      [req.params.id, req.params.profileId]
    );
    if (!edu) return next({ status: 404, message: 'Education record not found' });
    res.json({ status: 'success', data: edu });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { institution, degree, field_of_study, description, grade, start_date, end_date, is_current, institution_url, sort_order } = req.body;
    const { rows: [edu] } = await db.query(
      `INSERT INTO education (profile_id,institution,degree,field_of_study,description,grade,start_date,end_date,is_current,institution_url,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [profileId, institution, degree, field_of_study, description, grade, start_date, end_date, is_current, institution_url, sort_order || 0]
    );
    res.status(201).json({ status: 'success', data: edu });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const { institution, degree, field_of_study, description, grade, start_date, end_date, is_current, institution_url, sort_order } = req.body;
    const { rows: [edu] } = await db.query(
      `UPDATE education SET institution=$1,degree=$2,field_of_study=$3,description=$4,grade=$5,
         start_date=$6,end_date=$7,is_current=$8,institution_url=$9,sort_order=$10
       WHERE id=$11 AND profile_id=$12 RETURNING *`,
      [institution, degree, field_of_study, description, grade, start_date, end_date, is_current, institution_url, sort_order, id, profileId]
    );
    if (!edu) return next({ status: 404, message: 'Education record not found' });
    res.json({ status: 'success', data: edu });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rows: [edu] } = await db.query(
      `DELETE FROM education WHERE id=$1 AND profile_id=$2 RETURNING id`,
      [req.params.id, req.params.profileId]
    );
    if (!edu) return next({ status: 404, message: 'Education record not found' });
    res.json({ status: 'success', message: 'Education record deleted', id: edu.id });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };

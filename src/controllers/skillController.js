const db = require('../config/database');

// ---- Skill Categories ----

const getAllCategories = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT sc.*,
         COALESCE(json_agg(s.* ORDER BY s.sort_order) FILTER (WHERE s.id IS NOT NULL), '[]') AS skills
       FROM skill_categories sc
       LEFT JOIN skills s ON s.category_id = sc.id
       WHERE sc.profile_id = $1
       GROUP BY sc.id ORDER BY sc.sort_order`,
      [req.params.profileId]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, sort_order } = req.body;
    const { rows: [cat] } = await db.query(
      `INSERT INTO skill_categories (profile_id, name, sort_order) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.profileId, name, sort_order || 0]
    );
    res.status(201).json({ status: 'success', data: cat });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const { profileId, id } = req.params;
    const { name, sort_order } = req.body;
    const { rows: [cat] } = await db.query(
      `UPDATE skill_categories SET name=$1, sort_order=$2 WHERE id=$3 AND profile_id=$4 RETURNING *`,
      [name, sort_order, id, profileId]
    );
    if (!cat) return next({ status: 404, message: 'Skill category not found' });
    res.json({ status: 'success', data: cat });
  } catch (err) { next(err); }
};

const removeCategory = async (req, res, next) => {
  try {
    const { rows: [cat] } = await db.query(
      `DELETE FROM skill_categories WHERE id=$1 AND profile_id=$2 RETURNING id`,
      [req.params.id, req.params.profileId]
    );
    if (!cat) return next({ status: 404, message: 'Skill category not found' });
    res.json({ status: 'success', message: 'Category deleted', id: cat.id });
  } catch (err) { next(err); }
};

// ---- Skills ----

const getAllSkills = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT s.* FROM skills s
       JOIN skill_categories sc ON sc.id = s.category_id
       WHERE sc.profile_id=$1 AND s.category_id=$2
       ORDER BY s.sort_order`,
      [req.params.profileId, req.params.categoryId]
    );
    res.json({ status: 'success', data: rows });
  } catch (err) { next(err); }
};

const createSkill = async (req, res, next) => {
  try {
    const { name, level, years_exp, sort_order } = req.body;
    const { rows: [skill] } = await db.query(
      `INSERT INTO skills (category_id, name, level, years_exp, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.categoryId, name, level, years_exp, sort_order || 0]
    );
    res.status(201).json({ status: 'success', data: skill });
  } catch (err) { next(err); }
};

const updateSkill = async (req, res, next) => {
  try {
    const { categoryId, skillId } = req.params;
    const { name, level, years_exp, sort_order } = req.body;
    const { rows: [skill] } = await db.query(
      `UPDATE skills SET name=$1, level=$2, years_exp=$3, sort_order=$4
       WHERE id=$5 AND category_id=$6 RETURNING *`,
      [name, level, years_exp, sort_order, skillId, categoryId]
    );
    if (!skill) return next({ status: 404, message: 'Skill not found' });
    res.json({ status: 'success', data: skill });
  } catch (err) { next(err); }
};

const removeSkill = async (req, res, next) => {
  try {
    const { rows: [skill] } = await db.query(
      `DELETE FROM skills WHERE id=$1 AND category_id=$2 RETURNING id`,
      [req.params.skillId, req.params.categoryId]
    );
    if (!skill) return next({ status: 404, message: 'Skill not found' });
    res.json({ status: 'success', message: 'Skill deleted', id: skill.id });
  } catch (err) { next(err); }
};

module.exports = {
  getAllCategories, createCategory, updateCategory, removeCategory,
  getAllSkills, createSkill, updateSkill, removeSkill,
};

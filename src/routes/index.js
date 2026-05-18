const { Router } = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validate');

const profileCtrl       = require('../controllers/profileController');
const experienceCtrl    = require('../controllers/experienceController');
const educationCtrl     = require('../controllers/educationController');
const skillCtrl         = require('../controllers/skillController');
const projectCtrl       = require('../controllers/projectController');
const certificationCtrl = require('../controllers/certificationController');
const languageCtrl      = require('../controllers/languageController');
const contactCtrl       = require('../controllers/contactController');

const router = Router();

// ============================================================
// PROFILES
// ============================================================
router.get   ('/profiles',     profileCtrl.getAll);
router.get   ('/profiles/:id', profileCtrl.getById);
router.post  ('/profiles', [
  body('full_name').notEmpty().withMessage('full_name is required').trim(),
], validate, profileCtrl.create);
router.put   ('/profiles/:id', [
  body('full_name').notEmpty().withMessage('full_name is required').trim(),
], validate, profileCtrl.update);
router.delete('/profiles/:id', profileCtrl.remove);

// ============================================================
// CONTACTS  /profiles/:profileId/contacts
// ============================================================
router.get   ('/profiles/:profileId/contacts',     contactCtrl.getAll);
router.get   ('/profiles/:profileId/contacts/:id', contactCtrl.getById);
router.post  ('/profiles/:profileId/contacts', [
  body('type').notEmpty().withMessage('type is required'),
  body('value').notEmpty().withMessage('value is required'),
], validate, contactCtrl.create);
router.put   ('/profiles/:profileId/contacts/:id', [
  body('type').notEmpty(),
  body('value').notEmpty(),
], validate, contactCtrl.update);
router.delete('/profiles/:profileId/contacts/:id', contactCtrl.remove);

// ============================================================
// EXPERIENCES  /profiles/:profileId/experiences
// ============================================================
router.get   ('/profiles/:profileId/experiences',     experienceCtrl.getAll);
router.get   ('/profiles/:profileId/experiences/:id', experienceCtrl.getById);
router.post  ('/profiles/:profileId/experiences', [
  body('company').notEmpty().withMessage('company is required'),
  body('role').notEmpty().withMessage('role is required'),
  body('start_date').isDate().withMessage('start_date must be a valid date (YYYY-MM-DD)'),
], validate, experienceCtrl.create);
router.put   ('/profiles/:profileId/experiences/:id', [
  body('company').notEmpty(),
  body('role').notEmpty(),
  body('start_date').isDate(),
], validate, experienceCtrl.update);
router.delete('/profiles/:profileId/experiences/:id', experienceCtrl.remove);

// Highlights sub-resource
router.post  ('/profiles/:profileId/experiences/:experienceId/highlights', [
  body('description').notEmpty().withMessage('description is required'),
], validate, experienceCtrl.addHighlight);
router.put   ('/profiles/:profileId/experiences/:experienceId/highlights/:id', [
  body('description').notEmpty(),
], validate, experienceCtrl.updateHighlight);
router.delete('/profiles/:profileId/experiences/:experienceId/highlights/:id', experienceCtrl.removeHighlight);

// ============================================================
// EDUCATION  /profiles/:profileId/education
// ============================================================
router.get   ('/profiles/:profileId/education',     educationCtrl.getAll);
router.get   ('/profiles/:profileId/education/:id', educationCtrl.getById);
router.post  ('/profiles/:profileId/education', [
  body('institution').notEmpty().withMessage('institution is required'),
  body('start_date').isDate().withMessage('start_date must be a valid date'),
], validate, educationCtrl.create);
router.put   ('/profiles/:profileId/education/:id', [
  body('institution').notEmpty(),
  body('start_date').isDate(),
], validate, educationCtrl.update);
router.delete('/profiles/:profileId/education/:id', educationCtrl.remove);

// ============================================================
// SKILL CATEGORIES  /profiles/:profileId/skill-categories
// ============================================================
router.get   ('/profiles/:profileId/skill-categories', skillCtrl.getAllCategories);
router.post  ('/profiles/:profileId/skill-categories', [
  body('name').notEmpty().withMessage('name is required'),
], validate, skillCtrl.createCategory);
router.put   ('/profiles/:profileId/skill-categories/:id', [
  body('name').notEmpty(),
], validate, skillCtrl.updateCategory);
router.delete('/profiles/:profileId/skill-categories/:id', skillCtrl.removeCategory);

// SKILLS  /profiles/:profileId/skill-categories/:categoryId/skills
router.get   ('/profiles/:profileId/skill-categories/:categoryId/skills',          skillCtrl.getAllSkills);
router.post  ('/profiles/:profileId/skill-categories/:categoryId/skills', [
  body('name').notEmpty().withMessage('name is required'),
  body('level').optional().isInt({ min: 1, max: 5 }).withMessage('level must be 1-5'),
], validate, skillCtrl.createSkill);
router.put   ('/profiles/:profileId/skill-categories/:categoryId/skills/:skillId', [
  body('name').notEmpty(),
  body('level').optional().isInt({ min: 1, max: 5 }),
], validate, skillCtrl.updateSkill);
router.delete('/profiles/:profileId/skill-categories/:categoryId/skills/:skillId', skillCtrl.removeSkill);

// ============================================================
// PROJECTS  /profiles/:profileId/projects
// ============================================================
router.get   ('/profiles/:profileId/projects',     projectCtrl.getAll);   // ?featured=true
router.get   ('/profiles/:profileId/projects/:id', projectCtrl.getById);
router.post  ('/profiles/:profileId/projects', [
  body('title').notEmpty().withMessage('title is required'),
], validate, projectCtrl.create);
router.put   ('/profiles/:profileId/projects/:id', [
  body('title').notEmpty(),
], validate, projectCtrl.update);
router.delete('/profiles/:profileId/projects/:id', projectCtrl.remove);

// ============================================================
// CERTIFICATIONS  /profiles/:profileId/certifications
// ============================================================
router.get   ('/profiles/:profileId/certifications',     certificationCtrl.getAll);
router.get   ('/profiles/:profileId/certifications/:id', certificationCtrl.getById);
router.post  ('/profiles/:profileId/certifications', [
  body('title').notEmpty().withMessage('title is required'),
  body('issuing_org').notEmpty().withMessage('issuing_org is required'),
  body('issue_date').isDate().withMessage('issue_date must be a valid date'),
], validate, certificationCtrl.create);
router.put   ('/profiles/:profileId/certifications/:id', [
  body('title').notEmpty(),
  body('issuing_org').notEmpty(),
  body('issue_date').isDate(),
], validate, certificationCtrl.update);
router.delete('/profiles/:profileId/certifications/:id', certificationCtrl.remove);

// ============================================================
// LANGUAGES  /profiles/:profileId/languages
// ============================================================
router.get   ('/profiles/:profileId/languages',     languageCtrl.getAll);
router.get   ('/profiles/:profileId/languages/:id', languageCtrl.getById);
router.post  ('/profiles/:profileId/languages', [
  body('name').notEmpty().withMessage('name is required'),
  body('proficiency').optional().isIn(['native','fluent','advanced','intermediate','basic'])
    .withMessage('proficiency must be: native, fluent, advanced, intermediate or basic'),
], validate, languageCtrl.create);
router.put   ('/profiles/:profileId/languages/:id', [
  body('name').notEmpty(),
  body('proficiency').optional().isIn(['native','fluent','advanced','intermediate','basic']),
], validate, languageCtrl.update);
router.delete('/profiles/:profileId/languages/:id', languageCtrl.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');


router.post('/', noteController.createNote);
router.get('/', noteController.getAllNotes);
router.get('/:slug', noteController.getNoteBySlug);

module.exports = router;
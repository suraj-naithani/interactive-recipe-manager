const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Recipe = require('../models/Recipe');

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });


router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.render('recipes/index', { recipes });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/create', (req, res) => {
    res.render('recipes/create');
});

router.post('/', upload.single('image'), async (req, res) => {
    const { title, description, ingredients, instructions } = req.body;
    let imagePath = null;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    }
    const newRecipe = new Recipe({ title, description, ingredients, instructions, image: imagePath });
    try {
        await newRecipe.save();
        res.redirect('/recipes');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/:id/edit', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.render('recipes/edit', { recipe });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


router.put('/:id', upload.single('image'), async (req, res) => {
    const { title, description, ingredients, instructions } = req.body;
    let imagePath = req.body.currentImage;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    }

    try {
        let recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        recipe.title = title;
        recipe.description = description;
        recipe.ingredients = ingredients;
        recipe.instructions = instructions;
        recipe.image = imagePath;
        await recipe.save();
        res.redirect('/recipes');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.redirect('/recipes');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
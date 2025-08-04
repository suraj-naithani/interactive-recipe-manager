const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Recipe = require('../models/Recipe');
const {ensureAuthenticated} = require('../config/auth');


router.get('/create', ensureAuthenticated, (req, res) => {
    res.render('collections/create');
});


router.post('/', ensureAuthenticated, async (req, res) => {
    const {name, description} = req.body;
    const newCollection = new Collection({
        name,
        description,
        user: req.user.id,
        recipes: []
    });

    try{
        await newCollection.save();
        req.flash('success_msg', 'Collection created successfully');
        res.redirect('/dashboard');
    } catch(err){
        console.error(err);
        req.flash('error_msg', 'Error creating collection');
        res.redirect('/collections/create');
    }
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
    try{
        const collection = await Collection.findById(req.params.id).populate('recipes').populate('user', ['name']).lean();

        if(!collection){
            return res.status(404).send('Collection not found');
        }

        if(collection.user._id != req.user.id){
            return res.status(403).send('Unauthorized');
        }
        res.render('collections/collection', {collection});
    } catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put('/:id/addRecipe/:recipeId', ensureAuthenticated, async (req, res) => {
    try{
        const collection = await Collection.findById(req.params.id);
        const recipe = await Recipe.findById(req.params.recipeId);

        if(!collection || !recipe){
            return res.status(404).send('Collection or recipe not found');
        }

        if(collection.user.toString() !== req.user.id){
            return res.status(403).send('Unauthorized');
        }

        if(!collection.recipes.includes(recipe._id)){
            collection.recipes.push(recipe._id);
            await collection.save();
        }
        res.redirect(`/collections/${req.params.id}`);
    } catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put('/:id/removeRecipe/:recipeId', ensureAuthenticated, async (req, res) => {
    try{
        const collection = await Collection.findById(req.params.id);

        if(!collection){
            return res.status(404).send('Collection not found');
        }

        if(collection.user.toString() !== req.user.id){
            return res.status(403).send('Unauthorized');
        }

        collection.recipes = collection.recipes.filter(id => id.toString() !== req.params.recipeId);
        await collection.save();

        res.redirect(`/collections/${req.params.id}`);
    } catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try{
        const collection = await Collection.findById(req.params.id);
        if(!collection){
            return res.status(404).send('Collection not found');
        }

        if(collection.user.toString() !== req.user.id){
            return res.status(403).send('Unauthorized');
        }

        await Collection.deleteOne({_id: req.params.id});
        req.flash('success_msg', 'Collection deleted');
        res.redirect('/dashboard');
    } catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
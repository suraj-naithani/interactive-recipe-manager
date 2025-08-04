const Recipe = require('../models/Recipe');

exports.searchRecipes = async (req, res) => {
  try {
    const { keywords, ingredients, category } = req.query;
    const query = {};

    if (keywords) {
      query.$text = { $search: keywords };
    }

    if (ingredients) {
      query.ingredients = { $regex: new RegExp(ingredients, 'i') };
    }

    if (category) {
      query.category = category;
    }

    const recipes = await Recipe.find(query, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).limit(20);


    res.render('recipes/search', { recipes, searchQuery: req.query });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.getRecipe = async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).send('Recipe not found');
      }
      res.render('recipes/recipe', { recipe });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  };

exports.getAllRecipes = async (req, res) => {
    try {
      const recipes = await Recipe.find();
      res.render('recipes/index', {recipes});
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  };

exports.createRecipe = async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body);
        await newRecipe.save();
        res.redirect('/recipes');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
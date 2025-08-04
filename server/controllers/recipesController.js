const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');


exports.rateRecipe = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { recipeId, rating, review } = req.body;
    const userId = req.user._id; // Assuming authentication middleware provides req.user

    try {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

      const existingReview = recipe.reviews.find(r => r.user.equals(userId));

      if(existingReview){
        existingReview.rating = rating;
        existingReview.review = review;
      } else {
        recipe.reviews.push({ user: userId, rating, review });
      }

      await recipe.save();
      res.status(201).json({ message: 'Rating and review submitted successfully' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
};


exports.getRecipeReviews = async (req,res) => {
    const {recipeId} = req.params;
    try{
        const recipe = await Recipe.findById(recipeId).populate({
            path: 'reviews.user',
            select: 'username'
        });
        if(!recipe) return res.status(404).json({message: 'Recipe not found'});
        res.json(recipe.reviews);

    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

exports.validateRecipeReview = [
    body('recipeId').notEmpty().withMessage('Recipe ID is required'),
    body('rating').isNumeric().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('review').optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
]
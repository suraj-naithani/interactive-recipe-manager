const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/User'); // Assuming a User model exists
const Recipe = require('./models/Recipe'); // Assuming a Recipe model exists


mongoose.connect('mongodb://localhost:27017/recipe_app', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'secret', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) { return done(null, false); }
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(err);
        if (isMatch) return done(null, user);
        return done(null, false);
      });
    } catch (err) {
      return done(err);
    }
  }));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({...req.body, password: hashedPassword});
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});


app.post('/recipes', async (req,res) => {
    try{
        const newRecipe = new Recipe(req.body);
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

app.get('/recipes', async (req, res) => {
    try {
      const recipes = await Recipe.find();
      res.json(recipes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

app.get('/recipes/:id', async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
      res.json(recipe);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


app.put('/recipes/:id', async (req, res) => {
    try {
      const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedRecipe) return res.status(404).json({ message: 'Recipe not found' });
      res.json(updatedRecipe);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

app.delete('/recipes/:id', async (req, res) => {
    try {
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
      if (!deletedRecipe) return res.status(404).json({ message: 'Recipe not found' });
      res.json({ message: 'Recipe deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

app.get('/search', async (req, res) => {
    try {
      const searchTerm = req.query.q;
      const recipes = await Recipe.find({ $text: { $search: searchTerm } });
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
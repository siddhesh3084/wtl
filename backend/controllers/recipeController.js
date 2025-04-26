import Recipe from '../models/recipeModel.js';

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      imageUrl, 
      cookingTime, 
      difficulty, 
      ingredients, 
      instructions 
    } = req.body;

    const recipe = await Recipe.create({
      title,
      description,
      imageUrl,
      cookingTime,
      difficulty,
      ingredients,
      instructions,
      user: req.user._id
    });

    if (recipe) {
      res.status(201).json(recipe);
    } else {
      res.status(400);
      throw new Error('Invalid recipe data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
  try {
    const { difficulty, time } = req.query;
    
    let query = {};
    
    if (difficulty && difficulty !== 'All Difficulties') {
      query.difficulty = difficulty;
    }
    
    if (time && time !== 'Any Time') {
      // Implement time filtering logic based on your requirements
      if (time === 'Under 30 min') {
        query.cookingTime = { $lte: 30 };
      } else if (time === '30-60 min') {
        query.cookingTime = { $gt: 30, $lte: 60 };
      } else if (time === 'Over 60 min') {
        query.cookingTime = { $gt: 60 };
      }
    }
    
    const recipes = await Recipe.find(query)
      .populate('user', 'username')
      .sort({ createdAt: -1 });
      
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('user', 'username');
      
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (recipe) {
      // Check if user is the owner of the recipe
      if (recipe.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this recipe' });
      }
      
      const { 
        title, 
        description, 
        imageUrl, 
        cookingTime, 
        difficulty, 
        ingredients, 
        instructions 
      } = req.body;
      
      recipe.title = title || recipe.title;
      recipe.description = description || recipe.description;
      recipe.imageUrl = imageUrl || recipe.imageUrl;
      recipe.cookingTime = cookingTime || recipe.cookingTime;
      recipe.difficulty = difficulty || recipe.difficulty;
      recipe.ingredients = ingredients || recipe.ingredients;
      recipe.instructions = instructions || recipe.instructions;
      
      const updatedRecipe = await recipe.save();
      res.json(updatedRecipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (recipe) {
      // Check if user is the owner of the recipe
      if (recipe.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this recipe' });
      }
      
      await Recipe.deleteOne({ _id: req.params.id });
      res.json({ message: 'Recipe removed' });
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a recipe (add/remove from favorites)
// @route   POST /api/recipes/:id/like
// @access  Private
const likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = recipe.likes.includes(req.user._id);

    if (alreadyLiked) {
      recipe.likes = recipe.likes.filter(
        (like) => like.toString() !== userId
      );
    } else {
      recipe.likes.push(req.user._id);
    }

    await recipe.save();

    res.status(200).json({
      message: alreadyLiked ? 'Removed from favorites' : 'Added to favorites',
      likedByUser: !alreadyLiked,
      likeCount: recipe.likes.length,
      likes: recipe.likes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user's favorite recipes
// @route   GET /api/recipes/favorites
// @access  Private
const getFavoriteRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ likes: req.user._id })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};


export { 
  createRecipe, 
  getRecipes, 
  getRecipeById, 
  updateRecipe, 
  deleteRecipe, 
  likeRecipe 
};
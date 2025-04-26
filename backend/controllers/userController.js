import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add recipe to favorites
// @route   POST /api/users/favorites
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (user) {
      // Check if recipe is already in favorites
      if (user.favorites.includes(recipeId)) {
        return res.status(400).json({ message: 'Recipe already in favorites' });
      }
      
      user.favorites.push(recipeId);
      await user.save();
      
      res.status(200).json({ message: 'Recipe added to favorites' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove recipe from favorites
// @route   DELETE /api/users/favorites/:id
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.favorites = user.favorites.filter(
        favorite => favorite.toString() !== recipeId
      );
      
      await user.save();
      
      res.status(200).json({ message: 'Recipe removed from favorites' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  addToFavorites, 
  removeFromFavorites 
};
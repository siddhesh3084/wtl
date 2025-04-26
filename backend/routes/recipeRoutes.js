import express from 'express';
import { 
  createRecipe, 
  getRecipes, 
  getRecipeById, 
  updateRecipe, 
  deleteRecipe, 
  likeRecipe 
} from '../controllers/recipeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getRecipes)
  .post(protect, createRecipe);

router.route('/:id')
  .get(getRecipeById)
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);
  

router.post('/:id/like', protect, likeRecipe);

export default router;


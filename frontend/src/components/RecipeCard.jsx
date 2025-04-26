import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import {   Heart } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import api from '../api/axios';

const RecipeCard = ({ recipe, onLike }) => {
  const { user } = useContext(UserContext);
  const [isLiked, setIsLiked] = useState(
    user && recipe.likes && recipe.likes.includes(user._id)
  );

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if not logged in
      return;
    }
    
    try {
      await api.post(`/recipes/${recipe._id}/like`);
      
      setIsLiked(!isLiked);
      if (onLike) onLike(recipe._id);
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  return (
    <div className="recipe-card bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/recipe/${recipe._id}`}>
        <div className="relative h-48">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={handleLike}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md"
          >
            <Heart 
              className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{recipe.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{recipe.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{recipe.cookingTime} min</span>
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;
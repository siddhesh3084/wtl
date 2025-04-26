import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {   Clock,   Award,   Heart,   Edit,   Trash2,  ChevronLeft } from 'lucide-react';
import RecipeForm from '../components/RecipeForm';
import api from '../api/axios';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/recipes/${id}`);
      setRecipe(data);
      
      // Check if user has liked this recipe
      if (user && data.likes) {
        setIsLiked(data.likes.includes(user._id));
      }
      
      setError(null);
    } catch (error) {
      setError('Failed to fetch recipe details. Please try again later.');
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const { data } = await api.post(`/recipes/${id}/like`);
      setIsLiked(!isLiked);
      
      // Update recipe with new likes
      setRecipe({
        ...recipe,
        likes: data.likes
      });
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleUpdateRecipe = async (recipeData) => {
    try {
      const { data } = await api.put(`/recipes/${id}`, recipeData);
      setRecipe(data);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  const handleDeleteRecipe = async () => {
    try {
      await api.delete(`/recipes/${id}`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 text-xl">{error || 'Recipe not found'}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to recipes
        </button>
      </div>
    );
  }

  const isOwner = user && recipe.user && user._id === recipe.user._id;

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ChevronLeft className="h-5 w-5 mr-1" /> Back to recipes
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-96">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={handleLike}
            className="absolute top-4 right-4 p-3 rounded-full bg-white shadow-md"
          >
            <Heart 
              className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{recipe.title}</h1>
            
            {isOwner && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowEditForm(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-6">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              <span>{recipe.cookingTime} minutes</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Award className="h-5 w-5 mr-2 text-blue-600" />
              <span>{recipe.difficulty}</span>
            </div>
            {recipe.user && (
              <div className="text-gray-700">
                By: <span className="font-medium">{recipe.user.username}</span>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Instructions</h2>
            <div className="text-gray-700 whitespace-pre-line">
              {recipe.instructions}
            </div>
          </div>
        </div>
      </div>
      
      {showEditForm && (
        <RecipeForm 
          initialData={recipe}
          onSubmit={handleUpdateRecipe} 
          onClose={() => setShowEditForm(false)} 
        />
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Recipe</h3>
            <p className="mb-6">Are you sure you want to delete this recipe? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRecipe}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage;
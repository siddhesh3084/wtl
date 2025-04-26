import React, { useState, useEffect, useContext } from 'react';
import RecipeCard from '../components/RecipeCard';
import RecipeForm from '../components/RecipeForm';
import { UserContext } from '../context/UserContext';
import {  Search,  Plus } from 'lucide-react';
import api from '../api/axios';

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('All Difficulties');
  const [time, setTime] = useState('Any Time');
  
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchRecipes();
  }, [difficulty, time]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/recipes?difficulty=${difficulty}&time=${time}`);
      setRecipes(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch recipes. Please try again later.');
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = async (recipeData) => {
    try {
      await api.post('/recipes', recipeData);
      setShowRecipeForm(false);
      fetchRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  const handleLike = () => {
    fetchRecipes();
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-cover bg-center h-96 rounded-lg mb-8 flex flex-col items-center justify-center text-white p-4" 
           style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)' }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Discover & Share Amazing Recipes</h1>
        <p className="text-xl text-center mb-8">Join our community of food lovers and share your favorite recipes with the world</p>
        {user && (
          <button 
            onClick={() => setShowRecipeForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" /> Share Recipe
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Difficulties">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Any Time">Any Time</option>
            <option value="Under 30 min">Under 30 min</option>
            <option value="30-60 min">30-60 min</option>
            <option value="Over 60 min">Over 60 min</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">{error}</div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <p className="text-xl">No recipes found</p>
          <p className="mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              onLike={handleLike}
            />
          ))}
        </div>
      )}

      {showRecipeForm && (
        <RecipeForm 
          onSubmit={handleCreateRecipe} 
          onClose={() => setShowRecipeForm(false)} 
        />
      )}
    </div>
  );
};

export default HomePage;
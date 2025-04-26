import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import RecipeCard from '../components/RecipeCard';
import api from '../api/axios';

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      const { data } = await api.get('/users/profile');
      setFavorites(data.favorites || []);
      setError(null);
    } catch (error) {
      setError('Failed to fetch favorites. Please try again later.');
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (recipeId) => {
    // Update favorites list after unliking a recipe
    setFavorites(favorites.filter(recipe => recipe._id !== recipeId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Username:</span> {user.username}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Favorite Recipes</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            <p className="text-xl">No favorite recipes yet</p>
            <p className="mt-2">Like some recipes to add them to your favorites</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <RecipeCard 
                key={recipe._id} 
                recipe={recipe} 
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
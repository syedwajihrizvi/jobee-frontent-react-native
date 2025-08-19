import { favoriteJob } from '@/lib/updateUserProfile';
import useAuthStore from '@/store/auth.store';
import Entypo from '@expo/vector-icons/Entypo';
import React from 'react';
import { TouchableOpacity } from 'react-native';

const FavoriteJob = ({jobId}: {jobId: number}) => {
 const { setUser, user } = useAuthStore()
 const isFavorite = user?.favoriteJobs.some(fav => fav.id === jobId) ?? false;
 const handlePress = async () => {
  try {
    const result = await favoriteJob(jobId);
    if (result && user) {
      let newFavoriteJobs = []
      if (isFavorite) {
        newFavoriteJobs = [...user.favoriteJobs.filter(fav => fav.id !== jobId)]
      } else {
        newFavoriteJobs = [...user.favoriteJobs, { id: jobId }]
      }
      const updatedUser = {
        ...user,
        favoriteJobs: newFavoriteJobs
      }
      setUser(updatedUser);
    }
  } catch (error) {
    console.error('Error favoriting job:', error);// Revert to original state on error
  }
 }

  return (
          <TouchableOpacity 
            onPress={handlePress} 
            className='p-2 rounded-full shadow-md' style={{elevation: 2}}>
            <Entypo name="star" size={28} color={ isFavorite  ? "gold" : "black"} />
          </TouchableOpacity> 
  )
}

export default FavoriteJob
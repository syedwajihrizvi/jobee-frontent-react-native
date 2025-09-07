import { useFavoriteJobs } from '@/lib/services/useJobs';
import { favoriteJob } from '@/lib/updateUserProfile';
import useAuthStore from '@/store/auth.store';
import { User } from '@/type';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const FavoriteJob = ({jobId}: {jobId: number}) => {
 const { setUser, user: authUser, isAuthenticated } = useAuthStore()
 const [showModal, setShowModal] = useState(false);
 const { data: favoriteJobs, isLoading} = useFavoriteJobs();
 const isFavorite = favoriteJobs?.some(id => id === jobId) ?? false;
 const user = authUser as (User | null)

 const handlePress = async () => {
  if (!isAuthenticated) {
    setShowModal(true);
    return;
  }
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
    <>
      <TouchableOpacity 
        onPress={handlePress} 
        className='p-2 rounded-full shadow-md' style={{elevation: 2}}>
        <Entypo name="star" size={28} color={ isFavorite  ? "gold" : "black"} />
      </TouchableOpacity> 
      <Modal
        transparent
        animationType="fade"
        visible={showModal}>
      <View className='flex-1 bg-black/45 justify-center items-center'>
        <View
            style={{
                width: 300,
                height: 200,
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                gap: 10
            }}>
              <Text className='font-quicksand-bold text-xl'>Sign in to use feature</Text>
              <Text className='font-quicksand-medium text-center'>You need to be signed in to favorite a job.</Text>
                <View className='flex flex-row items-center justify-center w-full gap-2'>
                    <TouchableOpacity 
                        className='apply-button w-1/2 items-center justify-center h-14'
                        onPress={() => {
                            setShowModal(false);
                            router.push('/(auth)/sign-in');
                        }}>
                        <Text className='font-quicksand-bold'>Sign Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className='apply-button w-1/2 items-center justify-center h-14'
                        onPress={() => setShowModal(false)}>
                        <Text className='font-quicksand-bold'>Cancel</Text>
                    </TouchableOpacity>
                </View>
          </View>  
        </View>      
      </Modal>
    </>
  )
}

export default FavoriteJob
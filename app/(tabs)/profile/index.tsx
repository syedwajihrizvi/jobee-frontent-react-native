import ProfileLink from '@/components/ProfileLink';
import { images } from '@/constants';
import { getS3ProfileImage } from '@/lib/s3Urls';
import { updateUserProfileImage } from '@/lib/updateUserProfile';
import useAuthStore from '@/store/auth.store';
import { ProfileLinks } from '@/type';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const links: ProfileLinks[] = [
  {
    icon: <AntDesign name="user" size={28} color="black"/>,
    label: 'Edit Profile',
    onPress: () => router.push('/profile/editProfile')
  },
  {
    icon: <AntDesign name="filetext1" size={28} color="black"/>,
    label: 'Job Applied To',
    onPress: () => router.push('/profile/appliedJobs')
  },
  {
    icon: <AntDesign name="staro" size={28} color="black"/>,
    label: 'Favorite Jobs',
    onPress: () => router.push('/profile/favoriteJobs')
  },
  {
    icon: <Entypo name="documents" size={28} color="black" />,
    label: 'Manage Documents',
    onPress: () => router.push('/profile/manageDocs')
  },
  {
    icon: <AntDesign name="calendar" size={28} color="black"/>,
    label: 'Upcoming Interviews',
    onPress: () => console.log('Upcoming Interviews Pressed')
  },
  {
    icon: <AntDesign name="setting" size={28} color="black"/>,
    label: 'Account Settings',
    onPress: () => console.log('Settings Pressed')
  },
  {
    icon: <AntDesign name="logout" size={28} color="red"/>,
    label: 'Logout',
    onPress: () => {
      // Handle logout logic her
      AsyncStorage.removeItem('x-auth-token'); // Clear token from storage
      console.log('Logout Pressed');
      router.push('/(auth)/sign-in'); // Redirect to login page
    }
  }
]

const Profile = () => {
  const { isLoading, user } = useAuthStore()
  const [uploadingUserProfileImage, setUploadingUserProfileImage] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<string | null>(null);

  const handleProfileImagePicker = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow camera access to change profile picture.");
      return;
    }
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const cameraResult = await ImagePicker.launchCameraAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
              await uploadUserProfileImage(cameraResult);
            }
            return
          }
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const galleryResult = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets.length > 0) {
              // Handle the image upload logic here
              console.log('Image selected from gallery:', galleryResult.assets[0].uri);
              await uploadUserProfileImage(galleryResult);
              // You can also update the user profile image in your store or state
              // await updateUserProfileImage(galleryResult.assets[0].uri);
            }
            return
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }
  
  const uploadUserProfileImage = async (image: ImagePicker.ImagePickerResult) => {
  
    if (!image || !image.assets || image.assets.length === 0) {
      Alert.alert('No Image Selected', 'Please select an image to upload.');
      return;
    }
    setUploadingUserProfileImage(true);
    try {
      const response = await updateUserProfileImage(image);
      if (response) {
        Alert.alert('Success', 'Profile image updated successfully.');
        setUploadedProfileImage(response.profileImageUrl);
      } else {
        Alert.alert('Error', 'Failed to update profile image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'An error occurred while uploading the profile image. Please try again.');
    } finally {
      setUploadingUserProfileImage(false);
    }
  }

  const renderProfileImage = () => {
    if (!user || !user.profileImageUrl) {
      console.warn('User profile image URL is not available');
      return <Image source={{uri: images.companyLogo}} className='size-14 rounded-full' resizeMode='contain' />;
    } else if (uploadedProfileImage) {
      return <Image source={{uri: getS3ProfileImage(uploadedProfileImage)}} className='size-14 rounded-full' resizeMode='contain' />;
    }
    const uri = getS3ProfileImage(user.profileImageUrl);
    return <Image source={{uri}} className='size-14 rounded-full' resizeMode='contain' />;
  } 

  return (
    <SafeAreaView className="flex-1 bg-white h-full p-4">
      {
        isLoading ? 
        <ActivityIndicator size="large" color="#0000ff" className='mt-20'/> :
        <>
          <View className='flex-row w-full justify-between items-center'>
            <TouchableOpacity onPress={() => router.back()} >
              <AntDesign name="arrowleft" size={24} color="black"/>
            </TouchableOpacity>
            <Text className='text-lg font-semibold '>Profile</Text>
            <View style={{width:24}}/>
          </View>
          <View className='flex flex-row items-start'>
            <TouchableOpacity className='relative' onPress={handleProfileImagePicker}>
              {
              uploadingUserProfileImage ? <ActivityIndicator size="small" color="#0000ff" /> : 
              <>
                {renderProfileImage()}
                <Entypo name="edit" size={16} color="black" className='absolute -top-2 -right-2 bg-white rounded-full p-1'/>
              </>}
            </TouchableOpacity>
            <View>
              <Text className='font-quicksand-bold text-xl ml-2'>{user?.firstName} {user?.lastName}</Text>
              <Text className='font-quicksand-semibold text-md ml-2'>{user?.title}</Text>
            </View>
          </View>
          <View className='divider'/>
          <View className='flex-col gap-2 mt-4'>
            {links.map((link, index) => (
              <ProfileLink key={index} icon={link.icon} label={link.label} onPress={link.onPress} />
            ))}
          </View>
        </>}
    </SafeAreaView>
  )
}

export default Profile
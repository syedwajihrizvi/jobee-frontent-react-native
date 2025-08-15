import ProfileLink from '@/components/ProfileLink';
import { images } from '@/constants';
import { ProfileLinks } from '@/type';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const links: ProfileLinks[] = [
  {
    icon: <AntDesign name="user" size={28} color="black"/>,
    label: 'Edit Profile',
    onPress: () => console.log('Edit Profile Pressed')
  },
  {
    icon: <AntDesign name="filetext1" size={28} color="black"/>,
    label: 'Job Applied To',
    onPress: () => console.log('Job Applied To Pressed')
  },
  {
    icon: <AntDesign name="staro" size={28} color="black"/>,
    label: 'Favorite Jobs',
    onPress: () => console.log('Favorite Jobs Pressed')
  },
  {
    icon: <Entypo name="documents" size={28} color="black" />,
    label: 'Upload Documents',
    onPress: () => router.push('/profile/uploadDocuments')
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
  return (
    <SafeAreaView className="flex-1 bg-white h-full p-4">
      <View className='flex-row w-full justify-between items-center'>
        <TouchableOpacity onPress={() => router.back()} >
          <AntDesign name="arrowleft" size={24} color="black"/>
        </TouchableOpacity>
        <Text className='text-lg font-semibold '>Profile</Text>
        <View style={{width:24}}/>
      </View>
      <View className='flex flex-row items-start'>
        <Image source={{uri: images.companyLogo}} className='size-14 rounded-full' resizeMode='contain'/>
        <View>
          <Text className='font-quicksand-bold text-xl ml-2'>John Doe</Text>
          <Text className='font-quicksand-semibold text-md ml-2'>Software Engineer at Company</Text>
        </View>
      </View>
      <View className='divider'/>
      <View className='flex-col gap-2 mt-4'>
        {links.map((link, index) => (
          <ProfileLink key={index} icon={link.icon} label={link.label} onPress={link.onPress} />
        ))}
      </View>
    </SafeAreaView>
  )
}

export default Profile
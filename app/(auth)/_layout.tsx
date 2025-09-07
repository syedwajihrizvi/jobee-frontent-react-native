import useUserStore from '@/store/user.store'
import { Slot } from 'expo-router'
import React from 'react'
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { images } from '../../constants'

const AuthLayout = () => {
  const { type } = useUserStore()
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className='bg-white h-full'>
            <View className='w-full relative' style={{height: Dimensions.get('window').height/2.25}}>
                <ImageBackground 
                  source ={{ uri: images.placeholder }} 
                  className='w-full h-full rounded-b-lg' 
                  resizeMode='contain'/>
                <View className='absolute top-48 w-80 px-10'>
                    <Text className='font-quicksand-bold text-xl'>Get Started Now</Text>
                    <Text className='font-quicksand-semibold text-lg'>
                      {type === 'user' ? 'Create an account or login to explore your dream job.' : 'Create an account or login to manage your business.'}
                    </Text>
                </View>
            </View>
            <ScrollView className='-top-10'>
              <Slot/>
            </ScrollView>
        </View>
    </KeyboardAvoidingView>
  )
}

export default AuthLayout
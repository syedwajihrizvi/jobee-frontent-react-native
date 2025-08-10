import CustomButton from '@/components/CustomButton'
import { router, Slot } from 'expo-router'
import React from 'react'
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { images } from '../../constants'

const AuthLayout = () => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView className='bg-white h-full' keyboardShouldPersistTaps='handled'>
            <View className='w-full relative' style={{height: Dimensions.get('window').height/2.25}}>
                <ImageBackground 
                  source ={{ uri: images.placeholder }} 
                  className='size-full rounded-b-lg' 
                  resizeMode='contain'/>
                <View className='absolute top-48 w-80'>
                    <Text>Get Started Now</Text>
                    <Text>Create an account or login to explore your dream job.</Text>
                </View>
            </View>
            <View 
                className='flex-row items-center justify-center py-0.1 bg-gray-100 rounded-xl -top-10'
                style={{width: Dimensions.get('window').width*0.95, alignSelf: 'center'}}>
                <CustomButton text="Log In" customClass="bg-blue-500 p-4 rounded-lg m-2"  onClick={() => router.push("/sign-in")}/>
                <CustomButton text="Sign Up" customClass="bg-blue-500 p-4 rounded-lg m-2" onClick={() => router.push("/sign-up")}/>
            </View>
            <Slot/>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AuthLayout
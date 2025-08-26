import { Slot } from 'expo-router'
import React from 'react'
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { images } from '../../constants'

const AuthLayout = () => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className='bg-white h-full'>
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
            <ScrollView>
              <Slot/>
            </ScrollView>
        </View>
    </KeyboardAvoidingView>
  )
}

export default AuthLayout
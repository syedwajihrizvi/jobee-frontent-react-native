import CustomButton from '@/components/CustomButton'
import CustomInput from '@/components/CustomInput'
import { signInBusiness, signInUser } from '@/lib/auth'
import useAuthStore from '@/store/auth.store'
import useUserStore from '@/store/user.store'
import { SignInParams } from '@/type'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

const SignIn = () => {
  const [form, setForm] = useState<SignInParams>({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { fetchAuthenticatedUser, setIsAuthenticated } = useAuthStore()
  const { type, setType } = useUserStore()

  const handleSignInForUser = async () => {
    const { email, password } = form
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
    }
    else {
      setIsLoading(true)
      try {
        const result = await signInUser(form)
        if (!result) {
          Alert.alert('Error', 'Invalid email or password')
          return
        }
        await fetchAuthenticatedUser()
        setIsAuthenticated(true)
        setType('user')
        AsyncStorage.setItem('profileReminderShown', "false");
        router.replace("/(tabs)/users/jobs")
      } catch (error) {
        Alert.alert('Error', 'Failed to sign in. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSignInForBusiness = async () => {
    const { email, password } = form
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
    }
    else {
      setIsLoading(true)
      try {
        const result = await signInBusiness(form)
        if (!result) {
          Alert.alert('Error', 'Invalid email or password')
          return
        }
        await fetchAuthenticatedUser()
        setIsAuthenticated(true)
        setType('business')
        router.replace("/(tabs)/business/jobs")
      } catch (error) {
        Alert.alert('Error', 'Failed to sign in. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }
  const renderAccountTypeClass = (buttonType: 'user' | 'business') => {
    if (type === buttonType) {
      return 'border-b-2 border-green-500 pb-1'
    }
    return 'pb-1'
  }
  return (
    <View className='gap-2 bg-white px-4'>
      <View className='flex-row items-center justify-center gap-4'>
        <TouchableOpacity className={renderAccountTypeClass('user')} onPress={() => setType('user')}>
          <Text className='font-quicksand-bold'>User</Text>
        </TouchableOpacity>
        <TouchableOpacity className={renderAccountTypeClass('business')} onPress={() => setType('business')}>
          <Text className='font-quicksand-bold'>Enterprise</Text>
        </TouchableOpacity>
      </View>
      {
        type === 'user' ? 
        <>
        <CustomInput placeholder='Enter your email' label='Email' value={form.email} onChangeText={(text) => setForm({...form, email: text})}/>
        <CustomInput placeholder='Enter your password' label='Password' value={form.password} onChangeText={(text) => setForm({...form, password: text})}/>
        <CustomButton text="Login" customClass="apply-button py-4" onClick={handleSignInForUser} isLoading={isLoading}/>
        <View className='items-center'>
          <Text>Dont have an account? <Text onPress={() => router.navigate('/(auth)/sign-up')}>Sign Up</Text></Text>
        </View>
        </> : 
        <>
        <CustomInput placeholder='Enter your email' label='Email' value={form.email} onChangeText={(text) => setForm({...form, email: text})}/>
        <CustomInput placeholder='Enter your password' label='Password' value={form.password} onChangeText={(text) => setForm({...form, password: text})}/>
        <CustomButton text="Login" customClass="apply-button py-4" onClick={handleSignInForBusiness} isLoading={isLoading}/>
        <View className='items-center'>
          <Text>Business not registered? <Text onPress={() => router.navigate('/(auth)/sign-up')}>Register Now</Text></Text>
        </View>
        </>}
    </View>
  )
}

export default SignIn
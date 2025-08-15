import CustomButton from '@/components/CustomButton'
import CustomInput from '@/components/CustomInput'
import { signIn } from '@/lib/auth'
import useAuthStore from '@/store/auth.store'
import { SignInParams } from '@/type'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, View } from 'react-native'

const SignIn = () => {
  const [form, setForm] = useState<SignInParams>({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { fetchAuthenticatedUser, setIsAuthenticated } = useAuthStore()

  const handleSignIn = async () => {
    const { email, password } = form
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
    }
    else {
      setIsLoading(true)
      try {
        await signIn(form)
        await fetchAuthenticatedUser()
        setIsAuthenticated(true)
        router.replace("/(tabs)/jobs")
      } catch (error) {
        Alert.alert('Error', 'Failed to sign in. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <View className='gap-10 bg-white p-4 mt-5'>
      <CustomInput placeholder='Enter your email' label='Email' value={form.email} onChangeText={(text) => setForm({...form, email: text})}/>
      <CustomInput placeholder='Enter your password' label='Password' value={form.password} onChangeText={(text) => setForm({...form, password: text})}/>
      <CustomButton text="Login" customClass="auth-button" onClick={handleSignIn} isLoading={isLoading}/>
    </View>
  )
}

export default SignIn
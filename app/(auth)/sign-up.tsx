import CustomButton from '@/components/CustomButton'
import CustomInput from '@/components/CustomInput'
import { signUp } from '@/lib/auth'
import { SignUpParams } from '@/type'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, View } from 'react-native'

const SignUp = () => {
  const [form, setForm] = useState<SignUpParams>({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', age: 25 })
  const [isLoading, setIsLoading] = useState(false)
  const handleSignUp = async () => {
    const { email, password, confirmPassword, firstName, lastName, age } = form
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields')
    } else if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
    } else {
      setIsLoading(true)
      try {
        await signUp({email, password, firstName, confirmPassword, lastName, age})
        router.push("/sign-in")
      } catch (error) {
        console.error("Sign Up Error:", error)
        Alert.alert('Error', 'Failed to sign up. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }
  return (
    <View className='gap-10 bg-white p-4 mt-5'>
      <CustomInput placeholder='Enter your email' label='Email' value={form.email} onChangeText={(text) => setForm({...form, email: text})}/>
      <CustomInput placeholder='Enter your first name' label='First Name' value={form.firstName} onChangeText={(text) => setForm({...form, firstName: text})}/>
      <CustomInput placeholder='Enter your last name' label='Last Name' value={form.lastName} onChangeText={(text) => setForm({...form, lastName: text})}/>
      <CustomInput placeholder='Enter your password' label='Password' value={form.password} onChangeText={(text) => setForm({...form, password: text})}/>
      <CustomInput placeholder='Confirm your password' label='Confirm Password' value={form.confirmPassword} onChangeText={(text) => setForm({...form, confirmPassword: text})}/>
      <CustomButton text="Sign Up" customClass="auth-button" onClick={handleSignUp} isLoading={isLoading}/>
    </View>
  )
}

export default SignUp
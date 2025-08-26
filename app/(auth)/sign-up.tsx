import CustomButton from '@/components/CustomButton'
import CustomInput from '@/components/CustomInput'
import { signUpBusiness, signUpUser } from '@/lib/auth'
import useUserStore from '@/store/user.store'
import { BusinessSignUpParams, UserSignUpParams } from '@/type'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

const SignUp = () => {
  const [userForm, setUserForm] = useState<UserSignUpParams>(
    { email: '', password: '', confirmPassword: '', firstName: '', lastName: '', age: 25 })
  const [businessForm, setBusinessForm] = useState<BusinessSignUpParams>({ companyName: '', email: '', password: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { type, setType } = useUserStore()

  const handleUserSignUp = async () => {
    const { email, password, confirmPassword, firstName, lastName, age } = userForm
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields')
    } else if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
    } else {
      setIsLoading(true)
      try {
        await signUpUser({email, password, firstName, confirmPassword, lastName, age})
        setType('user')
        router.push("/sign-in")
      } catch (error) {
        console.error("Sign Up Error:", error)
        Alert.alert('Error', 'Failed to sign up. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBusinessSignUp = async () => {
    const {companyName, email, password, confirmPassword} = businessForm
    if (!companyName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    } else if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    } else {
      setIsLoading(true)
      try {
        await signUpBusiness({companyName, email, password, confirmPassword})
        setType('business')
        return router.push("/sign-in")
      } catch (error) {
        console.error("Sign Up Error:", error)
        Alert.alert('Error', 'Failed to sign up. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const renderAccountTypeClass = (buttonType: 'user' | 'business') => {
    if (type === buttonType) {
      return 'border-b-2 border-blue-500 pb-1'
    }
    return 'pb-1'
  }

  return (
    <View className='gap-6 bg-white px-4 pb-10'>
      <View className='flex-row items-center justify-center gap-2'>
        <TouchableOpacity className={renderAccountTypeClass('user')} onPress={() => setType('user')}>
          <Text>User</Text>
        </TouchableOpacity>
        <TouchableOpacity className={renderAccountTypeClass('business')} onPress={() => setType('business')}>
          <Text>Enterprise</Text>
        </TouchableOpacity>
      </View>
      {type === 'user' ? 
      <>
        <CustomInput placeholder='Enter your email' label='Email' value={userForm.email} onChangeText={(text) => setUserForm({...userForm, email: text})}/>
        <CustomInput placeholder='Enter your first name' label='First Name' value={userForm.firstName} onChangeText={(text) => setUserForm({...userForm, firstName: text})}/>
        <CustomInput placeholder='Enter your last name' label='Last Name' value={userForm.lastName} onChangeText={(text) => setUserForm({...userForm, lastName: text})}/>
        <CustomInput placeholder='Enter your password' label='Password' value={userForm.password} onChangeText={(text) => setUserForm({...userForm, password: text})}/>
        <CustomInput placeholder='Confirm your password' label='Confirm Password' value={userForm.confirmPassword} onChangeText={(text) => setUserForm({...userForm, confirmPassword: text})}/>
        <CustomButton text="Sign Up" customClass="auth-button" onClick={handleUserSignUp} isLoading={isLoading}/>
        <View className='items-center'>
          <Text>Already have an account? <Text onPress={() => router.navigate('/(auth)/sign-in')}>Sign In</Text></Text>
        </View>
      </> : 
      <>
        <CustomInput autoCapitalize="words" placeholder='Enter your company name' label='Company' value={businessForm.companyName} onChangeText={(text) => setBusinessForm({...businessForm, companyName: text})}/>
        <CustomInput placeholder='Enter your email' label='Email' value={businessForm.email} onChangeText={(text) => setBusinessForm({...businessForm, email: text})}/>
        <CustomInput placeholder='Enter your password' label='Password' value={businessForm.password} onChangeText={(text) => setBusinessForm({...businessForm, password: text})}/>
        <CustomInput placeholder='Confirm your password' label='Confirm Password' value={businessForm.confirmPassword} onChangeText={(text) => setBusinessForm({...businessForm, confirmPassword: text})}/>
        <CustomButton text="Join Now" customClass="auth-button" onClick={handleBusinessSignUp} isLoading={isLoading}/>
        <View className='items-center'>
          <Text>Company already registered? <Text onPress={() => router.navigate('/(auth)/sign-in')}>Sign In</Text></Text>
        </View>
      </>}
    </View>
  )
}

export default SignUp
import { SignInParams, SignUpParams } from "@/type";
import Asyncstorage from "@react-native-async-storage/async-storage";

const ACCOUNTS_API_URL = "http://192.168.2.29:8080/accounts";
const PROFILES_API_URL = "http://192.168.2.29:8080/profiles";

export const signIn = async (request: SignInParams) => {
    const response = await fetch(`${ACCOUNTS_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)   
    })
    const data = await response.json()
    if (response.status === 200) {
        await Asyncstorage.setItem('x-auth-token', data.token)
    }
    return true
}

export const signUp = async (request: SignUpParams) => {
    console.log("Signing Up...", request)
    const { email, password, firstName, lastName, age } = request
    // Simulate an API call
    await fetch(`${ACCOUNTS_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email,password,firstName,lastName,age})
    })
    return true
}

export const signOut = async () => {
    await Asyncstorage.removeItem('x-auth-token')
    return true
}

export const getCurrentUser = async () => {
    console.log("Fetching current user...")
    const token = await Asyncstorage.getItem('x-auth-token')
    console.log("Token:", token)
    if (!token) return null

    const response = await fetch(`${PROFILES_API_URL}/me`, {
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })

    if (response.status === 200) {
        const data = await response.json()
        return data
    }
    return null
}
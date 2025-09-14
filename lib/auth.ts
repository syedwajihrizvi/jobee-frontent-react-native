import { BusinessSignUpParams, SignInParams, UserSignUpParams } from "@/type";
import Asyncstorage from "@react-native-async-storage/async-storage";

const USER_ACCOUNTS_API_URL = "http://192.168.2.29:8080/accounts";
const PROFILES_API_URL = "http://192.168.2.29:8080/profiles";
const BUSINESS_ACCOUNTS_API_URL = "http://192.168.2.29:8080/business-accounts";

export const signInUser = async (request: SignInParams) => {
    const response = await fetch(`${USER_ACCOUNTS_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)   
    })
    const data = await response.json()
    if (response.status === 200) {
        await Asyncstorage.setItem('x-auth-token', data.token)
        await Asyncstorage.setItem('userType', "user");
        return true
    }
    return false
}

export const signInBusiness= async (request: SignInParams) => {
    const response = await fetch(`${BUSINESS_ACCOUNTS_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)   
    })
    const data = await response.json()
    if (response.status === 200) {
        await Asyncstorage.setItem('x-auth-token', data.token)
        await Asyncstorage.setItem('userType', "business");
        return true
    }
    return false
}

export const signUpUser = async (request: UserSignUpParams) => {
    const { email, password, firstName, lastName, age } = request
    const result = await fetch(`${USER_ACCOUNTS_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email,password,firstName,lastName,age})
    })
    return result.status === 201
}

export const signUpBusiness = async (request: BusinessSignUpParams) => {
    const { companyName, email, password } = request
    const result = await fetch(`${BUSINESS_ACCOUNTS_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email,password, companyName})
    })
    return result.status === 201
}
    
export const signOut = async () => {
    await Asyncstorage.removeItem('x-auth-token')
    await Asyncstorage.setItem('profileReminderShown', "false");
    await Asyncstorage.removeItem('userType');
    return true
}

export const getCurrentUser = async () => {
    const accountType = await Asyncstorage.getItem('userType')
    if (!accountType) return null
    const targetUrl = accountType === "user" ? PROFILES_API_URL : BUSINESS_ACCOUNTS_API_URL;
    const token = await Asyncstorage.getItem('x-auth-token')
    if (!token) return null

    const response = await fetch(`${targetUrl}/me`, {
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
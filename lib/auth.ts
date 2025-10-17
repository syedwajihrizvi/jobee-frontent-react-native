import { BusinessSignUpParams, SignInParams, UserSignUpParams } from "@/type";
import Asyncstorage from "@react-native-async-storage/async-storage";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const USER_ACCOUNTS_API_URL = "http://192.168.2.29:8080/accounts";
const PROFILES_API_URL = "http://192.168.2.29:8080/profiles";
const BUSINESS_ACCOUNTS_API_URL = "http://192.168.2.29:8080/business-accounts";
const BUSINESS_PROFILES_API_URL = "http://192.168.2.29:8080/business-profiles";

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
    const { email, password, firstName, lastName } = request
    const result = await fetch(`${USER_ACCOUNTS_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email,password,firstName,lastName})
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

export const getUserProfileDashboardSummary = async () => {
    const token = await Asyncstorage.getItem('x-auth-token')
    if (!token) return null
    const targetUrl = `${PROFILES_API_URL}/dashboard`;
    const response = await fetch(targetUrl, {
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    console.log(response)
    if (response.status === 200) {
        const data = await response.json()
        console.log(data)
        return data
    }
}

export const getBusinessUserProfileDashboardSummary = async () => {
    const token = await Asyncstorage.getItem('x-auth-token')
    if (!token) return null
    const targetUrl = `${BUSINESS_PROFILES_API_URL}/dashboard`;
    const response = await fetch(targetUrl, {
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (response.status === 200) {
        const data = await response.json()
        return data
    }
}

export const registerForPushNotifications = async () => {
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
        return token;
    } else {
        console.log("Physical device is not being used")
    }
}
    
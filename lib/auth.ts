import { getAPIUrl } from "@/constants";
import { BusinessSignUpParams, SignInParams, SignUpViaCodeParams, UserSignUpParams } from "@/type";
import Asyncstorage from "@react-native-async-storage/async-storage";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const USER_ACCOUNTS_API_URL = getAPIUrl('accounts');
const PROFILES_API_URL = getAPIUrl('profiles');
const BUSINESS_ACCOUNTS_API_URL = getAPIUrl('business-accounts');
const BUSINESS_PROFILES_API_URL = getAPIUrl('business-profiles');
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
    const { companyName, email, password, firstName, lastName } = request
    const result = await fetch(`${BUSINESS_ACCOUNTS_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email,password, companyName, firstName, lastName})
    })
    const data = await result.json()
    return data;
}

export const signUpBusinessViaCode = async (request: SignUpViaCodeParams) => {
    const { companyCode, email, password, phoneNumber, firstName, lastName } = request
    const result = await fetch(`${BUSINESS_ACCOUNTS_API_URL}/register-via-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({companyCode:companyCode.replace(" ","").toLowerCase(), email, password, phoneNumber, firstName, lastName})
    })
    console.log("Sign up via code response status:", result);
    if (result.status !== 201) return null;
    const data = await result.json()
    return data;
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
    if (response.status === 200) {
        const data = await response.json()
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
        return token;
    } else {
        console.log("Physical device is not being used")
    }
}
    
export const sendInviteForJobee = async (email: string, phone: string, selectedUserType: string) => {
    const token = await Asyncstorage.getItem('x-auth-token');
    const result = await fetch(`${BUSINESS_ACCOUNTS_API_URL}/invite-member`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ email, phone, selectedUserType })
    })
    return result.status === 200;
}

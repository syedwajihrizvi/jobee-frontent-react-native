import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagePickerResult } from "expo-image-picker";

import { getAPIUrl } from "@/constants";
import { ProfileImageUpdate } from "@/type";
import { convertSocialMediaTypeToEnum } from "../utils";

const COMPANIES_API_URL = getAPIUrl('companies');
const BUSINESS_PROFILES_API_URL = getAPIUrl('business-profiles');
const SOCIAL_MEDIA_API_URL = getAPIUrl('business-profiles/socialMedia');

export const updateBusinessProfileImage = async (image: ImagePickerResult) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    const localUri = image.assets![0].uri;
    const fileName = image.assets![0].fileName || localUri.split('/').pop() || 'profile.jpg';
    const type = image.assets![0].type || 'image/jpeg';
    formData.append('profileImage', {
        uri: localUri,
        name: fileName,
        type
    } as any);
    const response = await fetch(
        `${BUSINESS_PROFILES_API_URL}/update-profile-image/me`, {
        method: 'PATCH',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        },
        body: formData,
    });
    const data = await response.json();
    if (response.status === 200) return data as ProfileImageUpdate;
    return null;
}

export const updateCompanyLogo = async (image: ImagePickerResult, companyId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    const localUri = image.assets![0].uri;
    const fileName = image.assets![0].fileName || localUri.split('/').pop() || 'profile.jpg';
    const type = image.assets![0].type || 'image/jpeg';
    formData.append('profileImage', {
        uri: localUri,
        name: fileName,
        type
    } as any);
    const response = await fetch(
        `${COMPANIES_API_URL}/${companyId}/logo`, {
        method: 'PATCH',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        },
        body: formData,
    });
    const data = await response.json();
    if (response.status === 200) return data as ProfileImageUpdate;
    return null;
}

export const updateGeneralInfoForBusinessUser = async ({field, value}: {field: string, value: string}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    if (!field) return null;
    const body = {
        [field]: value
    }

    const response = await fetch(`${BUSINESS_PROFILES_API_URL}/update-general-info/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    return response.status === 200;
}

export const updateBusinessUserLocation = async ({city, country, state }: {city: string, country: string, state: string}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const body = {
        city,
        country,
        state
    }
    const response = await fetch(`${BUSINESS_PROFILES_API_URL}/update-general-info/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    return response.status === 200;
}

export const updateCompanyProfile = async ({field, value, companyId}: {field: string, value: string, companyId: number}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    if (!field) return null;
    const body = {
        [field]: value
    }
    const response = await fetch(`${COMPANIES_API_URL}/${companyId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    return response.status === 200;
}

export const updateCompanyLocation = async ({city, country, state, companyId }: {city: string, country: string, state: string, companyId: number}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const body = {
        hqCity: city,
        hqCountry: country,
        hqState: state
    }
    const response = await fetch(`${COMPANIES_API_URL}/${companyId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    return response.status === 200;
}

export const createBusinessSocialMediaLink = async (type: string, url: string) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const res = await fetch(SOCIAL_MEDIA_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ type: convertSocialMediaTypeToEnum(type), url })
    });
    if (res.status === 201 || res.status === 200) {
        const data = await res.json();
        return data;
    }
    return null;
}

export const updateBusinessSocialMediaLink = async (type: string, url: string, id:number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const res = await fetch(`${BUSINESS_PROFILES_API_URL}/socialMedia/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify({ type: convertSocialMediaTypeToEnum(type), url })
    });
    if (res.status === 200) {
        const data = await res.json();
        console.log("Update social media link response data:", data);
        return data;
    }
    return null;
}

export const getCustomCompanyFormPlaceholderField = (field: string) => {
  switch(field) {
    case 'Company Name':
      return "e.g. Amazon";
    case 'Industry':
      return "e.g. Information Technology";
    case 'Description':
      return "e.g. Amazon is a multinational technology company...";
    case 'Location':
      return "e.g. Seattle, WA";
    case 'Company Size':
      return "e.g. 10,000+ employees";
    case 'Website':
      return "e.g. www.amazon.com";
    case 'LinkedIn':
      return "e.g. linkedin.com/company/amazon";
    default:
      return "e.g. Value";
}
}
import { AddUserSkillForm, ProfileImageUpdate, UserSkill } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagePickerResult } from "expo-image-picker";

const PROFILES_API_URL = 'http://10.0.0.135:8080/profiles';
export const updateUserProfileImage = async (image: ImagePickerResult)=> {
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
        `${PROFILES_API_URL}/update-profile-image`, {
        method: 'PATCH',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        },
        body: formData,
    });
    const data = await response.json();
    if (response.status === 200) return data as ProfileImageUpdate;
    return null;
};

export const favoriteJob = async (jobId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/favorite-jobs?jobId=${jobId}`, {
        method: 'POST',
        headers: {
            'x-auth-token': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (result.status === 200) {
        return true;
    }
    return false;
};

export const addSkill = async (newSkill: AddUserSkillForm) => {
    return new Promise<UserSkill | null>(async (resolve) => {
        setTimeout(async () => {
            const token = await AsyncStorage.getItem('x-auth-token');
            if (token == null) return null;
            const result = await fetch(`${PROFILES_API_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
            body: JSON.stringify(newSkill)
        })
        const response = await result.json();
        console.log("Response from addSkill:", response);
        if (result.status === 201) return resolve(response as UserSkill)
        return resolve(null);
    }, 3000)})
}
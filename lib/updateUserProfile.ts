import { AddUserEducationForm, AddUserSkillForm, Education, ProfileImageUpdate, UserSkill } from "@/type";
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
        if (result.status === 201 || result.status === 200) 
                return resolve(response as UserSkill)
        return resolve(null);
    }, 3000)})
}

export const addEducation = async (newEducation: AddUserEducationForm) => {
    return await new Promise<Education | null>((resolve, reject) => {
        setTimeout(async () => {
            const token = await AsyncStorage.getItem('x-auth-token');
            const result = await fetch(`${PROFILES_API_URL}/education`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': `Bearer ${token}`
                },
                body: JSON.stringify(newEducation)
            })
            const response = await result.json();
            console.log("Response from addEducation:", response);
            if (result.status === 201) 
                return resolve(response as Education)
            return resolve(null);
        }, 3000)});
}

export const editEducation = async (educationId: number, updatedEducation: AddUserEducationForm) => {
    console.log("Updating education with ID:", educationId, "with data:", updatedEducation);
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) return null
        const result = await fetch(`${PROFILES_API_URL}/education/${educationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
            body: JSON.stringify(updatedEducation)
        });
        console.log("Response status:", result.status);
        const response = await result.json();
        if (result.status === 200) return response as Education;
        throw new Error("Failed to update education");
    } catch (error) {
        console.error("Error updating education:", error);
        return null;
    }
}
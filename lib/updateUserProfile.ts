import { AddExperienceForm, AddUserEducationForm, AddUserSkillForm, CompleteProfileForm, Education, Experience, ProfileImageUpdate, UserSkill } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from 'expo-document-picker';
import { ImagePickerResult } from "expo-image-picker";

const PROFILES_API_URL = 'http://192.168.2.29:8080/profiles';
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

export const updateUserVideoIntro = async (videoIntro: ImagePickerResult) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData()
    if (videoIntro && videoIntro.assets && videoIntro.assets.length > 0) {
        const localUri = videoIntro.assets[0].uri;
        const fileName = videoIntro.assets[0].fileName || localUri.split('/').pop() || 'intro.mp4';
        const type = videoIntro.assets[0].type || 'video/mp4';
        formData.append('videoIntro', {
            uri: localUri,
            name: fileName,
            type
        } as any);
    }
    const result = await fetch(`${PROFILES_API_URL}/update-video-intro`, {
        method: 'PATCH',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        },
        body: formData,
    });
    if (result.status === 200) {
        const data = await result.json();
        return data;
    }
    return null
}

export const removeVideoIntro = async () => {
    console.log("Removing video intro...");
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/remove-video-intro`, {
        method: 'PATCH',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        }
    });
    if (result.status === 204) {
        return true;
    }
    return false;
}

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
            if (result.status === 201) 
                return resolve(response as Education)
            return resolve(null);
        }, 3000)});
}

export const editEducation = async (educationId: number, updatedEducation: AddUserEducationForm) => {
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
        const response = await result.json();
        if (result.status === 200) return response as Education;
        throw new Error("Failed to update education");
    } catch (error) {
        console.error("Error updating education:", error);
        return null;
    }
}

export const addExperience = async (newExperience: AddExperienceForm) => {
    return await new Promise<Experience | null>((resolve, reject) => {
        setTimeout(async () => {
            const token = await AsyncStorage.getItem('x-auth-token');
            const result = await fetch(`${PROFILES_API_URL}/experiences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': `Bearer ${token}`
                },
                body: JSON.stringify(newExperience)
            })
            if (result.status === 201) {
                const response = await result.json()
                return resolve(response as Experience)
            }
            return resolve(null)
        }, 3000)
    })
}

export const editExperience = async (experienceId: number, updatedExperience: AddExperienceForm) => {
    return await new Promise<Experience | null>((resolve, reject) => {
        setTimeout(async () => {
            const token = await AsyncStorage.getItem('x-auth-token')
            if (!token) return resolve(null)
            const result = await fetch(`${PROFILES_API_URL}/experiences/${experienceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedExperience)
            })
            const response = await result.json()
            if (result.status === 200) return resolve(response as Experience)
            return resolve(null)
        }, 3000)
    })   
}

export const completeProfile = async (
    document: DocumentPicker.DocumentPickerResult,
    image: ImagePickerResult,
    videoIntro: ImagePickerResult,
    details: CompleteProfileForm,
    resumeTitle: string
) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const formData = new FormData();
    if (document && document.assets && document.assets.length > 0) {
        formData.append('resume', {
            uri: document.assets[0].uri,
            name: document.assets[0].name,
            type: document.assets[0].mimeType,
        } as any);
    }
    if (image && image.assets && image.assets.length > 0) {
        const localUri = image.assets[0].uri;
        const fileName = image.assets[0].fileName || localUri.split('/').pop() || 'profile.jpg';
        const type = image.assets[0].type || 'image/jpeg';
        formData.append('profileImage', {
            uri: localUri,
            name: fileName,
            type
        } as any);
    }
    if (videoIntro && videoIntro.assets && videoIntro.assets.length > 0) {
        const localUri = videoIntro.assets[0].uri;
        const fileName = videoIntro.assets[0].fileName || localUri.split('/').pop() || 'intro.mp4';
        const type = videoIntro.assets[0].type || 'video/mp4';
        formData.append('videoIntro', {
            uri: localUri,
            name: fileName,
            type
        } as any);
    }
    const { phoneNumber } = details;
    if (phoneNumber != null) {
        const formattedNumber = phoneNumber.replace(/[\s()]/g, '');
        details.phoneNumber = formattedNumber;
    }
    formData.append('data', JSON.stringify(details));
    formData.append('resumeTitle', resumeTitle);
    try {
        const response = await fetch(
            `${PROFILES_API_URL}/complete-profile`, {
            method: 'PATCH',
            headers: {
                'x-auth-token': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        return null;
    }
}
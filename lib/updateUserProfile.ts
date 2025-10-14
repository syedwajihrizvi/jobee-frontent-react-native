import { AddExperienceForm, AddProjectForm, AddUserEducationForm, AddUserSkillForm, CompleteProfileForm, Education, Experience, ProfileImageUpdate, Project } from "@/type";
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
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const res = await fetch(`${PROFILES_API_URL}/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
            body: JSON.stringify(newSkill)
        })
    if (res.status === 201 || res.status === 200) {
        const data = await res.json();
        console.log("Add skill response data:", data);
        return data;
    }
    return null;
}

export const addEducation = async (newEducation: AddUserEducationForm) => {
    if (!newEducation.toYear) {
        newEducation.toYear = 'Present';
    }
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/education`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(newEducation)
    });
    if (result.status === 201) {
        const response = await result.json();
        return response as Education;
    }
    return null;
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
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
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
                return response as Experience
            }
            return null
}

export const addProject = async (newProject: AddProjectForm) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
    });
    const response = await result.json();
    if (result.status === 201) return response as Project;
    return null;
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

export const editProject = async (projectId: number, updatedProject: AddProjectForm) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProject)
    });
    const response = await result.json();
    if (result.status === 200) return response as Project;
    return null;
}

export const deleteSkill = async (skillId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        }
    });
    return result.status === 204;
}

export const deleteEducation = async (educationId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/education/${educationId}`, {
        method: 'DELETE',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        }
    });
    return result.status === 204;
}

export const deleteExperience = async (experienceId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/experiences/${experienceId}`, {
        method: 'DELETE',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        }
    });
    return result.status === 204;
}

export const deleteProject = async (projectId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const result = await fetch(`${PROFILES_API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        }
    });
    return result.status === 204;
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
        const formattedNumber = phoneNumber.replace(/[\s()-]/g, '');
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

export const mapGeneralInfoFieldToAPIField = (field: string) : string => {
    switch (field) {
        case 'First Name':
            return 'firstName';
        case 'Last Name':
            return 'lastName';
        case 'Phone Number':
            return 'phoneNumber';
        case 'Title':
            return 'title';
        case 'City':
            return 'city';
        case 'Country':
            return 'country';
        case 'State':
            return 'state';
        case 'Company':
            return 'company';
        default:
            return '';  
    }
}
export const updateGeneralInfo = async ({field, value}: {field: string, value: string}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    if (!field) return null;
    const body = {
        [field]: value
    }
    const response = await fetch(`${PROFILES_API_URL}/update-general-info`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    return response.status === 200;
}

export const updateUserLocation = async ({city, country, state }: {city: string, country: string, state: string}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const body = {
        city,
        country,
        state
    }
    const response = await fetch(`${PROFILES_API_URL}/update-general-info`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    return response.status === 200;
}

export const updateProfileSummary = async (summary: string) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (!token) return null;
    const body = { summary };
    const response = await fetch(`${PROFILES_API_URL}/update-summary`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    return response.status === 200;
}

export const addViewToProfile = async (id: number) => {

    try {
        const result = await fetch(`${PROFILES_API_URL}/${id}/views`, {
            method: 'PATCH'
        })
        console.log("Status of View: " + result.status)
    } catch (error) {
        console.error("Error adding view to job:", error)
    }
}  
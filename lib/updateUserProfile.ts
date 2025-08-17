import { ProfileImageUpdate } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagePickerResult } from "expo-image-picker";

const PROFILES_API_URL = 'http://10.0.0.135:8080/profiles';
export const updateUserProfileImage = async (image: ImagePickerResult)=> {
    console.log(`File Size: ${image.assets![0].fileSize}`);
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
    console.log('Updating profile image with form data:', formData);
    const response = await fetch(
        `${PROFILES_API_URL}/update-profile-image`, {
        method: 'PATCH',
        headers: {
            'x-auth-token': `Bearer ${token}`,
        },
        body: formData,
    });
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Update profile image response:', data);
    if (response.status === 200) {
        return data as ProfileImageUpdate;
    }
    return null;
};
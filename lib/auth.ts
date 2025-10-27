import { BusinessSignUpParams, SignInParams, UserSignUpParams } from "@/type";
import Asyncstorage from "@react-native-async-storage/async-storage";
import * as AuthSession from 'expo-auth-session';
import * as Device from 'expo-device';
import { Directory, File, Paths } from "expo-file-system";
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

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
    

// OAuth configuration
// Google Drive OAuth
export const connectToGoogleDriveOAuth = async () => {
    const CLIENT_ID = '728245733416-e3v4vjcabroubam6d745iq7clpq5rffq.apps.googleusercontent.com';
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'com.googleusercontent.apps.728245733416-e3v4vjcabroubam6d745iq7clpq5rffq:/oauthredirect'
    });
    console.log('Redirect URI:', REDIRECT_URI);
    const DISCOVERY = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };
    
    const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scopes: ['https://www.googleapis.com/auth/drive.readonly', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
    });
    const result = await request.promptAsync(DISCOVERY);
    const { codeVerifier } = request
    console.log('OAuth Result:', result);
    const successful = result.type === 'success';
    if (successful && codeVerifier) {
        const {code} =  result.params
        const tokens = await exhchangeGoogleOAuthCodeForToken(code, codeVerifier);
        console.log('OAuth Tokens:', tokens);
        return tokens;
    }
    return null;
}

export const exhchangeGoogleOAuthCodeForToken = async (code: string, codeVerifier: string) => {
    const CLIENT_ID = '728245733416-e3v4vjcabroubam6d745iq7clpq5rffq.apps.googleusercontent.com';
    const REDIRECT_URI = AuthSession.makeRedirectUri({
         scheme: 'com.googleusercontent.apps.728245733416-e3v4vjcabroubam6d745iq7clpq5rffq:/oauthredirect'
    });
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('code_verifier', codeVerifier);
    params.append('client_id', CLIENT_ID);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('grant_type', 'authorization_code');
    const queryParams = params.toString();
    console.log('Token Request Params:', queryParams);
    const response = await fetch(`https://oauth2.googleapis.com/token?${queryParams}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    const data = await response.json();
    const { access_token, refresh_token, expires_in, id_token } = data;
    const res = await storeGoogleTokensOnDevice({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        idToken: id_token
    })
    if (!res) {
        return null
    } 
    console.log('Token Response:', data);
    return true;
}

export const storeGoogleTokensOnDevice = async ({accessToken, refreshToken, expiresIn, idToken}: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    idToken: string;
}) => {
    const storedAt = Date.now();
    const expiresAt = storedAt + expiresIn * 1000;
    try {
        await SecureStore.setItemAsync('googleDriveAccessToken', accessToken);
        await SecureStore.setItemAsync('googleDriveRefreshToken', refreshToken);
        await SecureStore.setItemAsync('googleDriveExpiresIn', expiresIn.toString());
        await SecureStore.setItemAsync('googleDriveStoredAt', storedAt.toString());
        await SecureStore.setItemAsync('googleDriveExpiresAt', expiresAt.toString());
        await SecureStore.setItemAsync('googleDriveIdToken', idToken);
        return true;
    } catch (error) {
        console.error('Error storing tokens:', error);
        return false;
    }
}

export const fetchGoogleDriveAccessToken = async () => {
    const accessToken = await SecureStore.getItemAsync('googleDriveAccessToken');
    return accessToken;
}

export const getStoredGoogleDriveRefreshToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('googleDriveRefreshToken');
    return refreshToken;
}

export const getStoredGoogleDriveTokenExpiry = async () => {
    const expiresAt = await SecureStore.getItemAsync('googleDriveExpiresAt');
    return expiresAt ? parseInt(expiresAt, 10) : null;
}

export const clearStoredGoogleDriveTokens = async () => {
    await SecureStore.deleteItemAsync('googleDriveAccessToken');
    await SecureStore.deleteItemAsync('googleDriveRefreshToken');
    await SecureStore.deleteItemAsync('googleDriveExpiresIn');
    await SecureStore.deleteItemAsync('googleDriveStoredAt');
    await SecureStore.deleteItemAsync('googleDriveExpiresAt');
    await SecureStore.deleteItemAsync('googleDriveIdToken');
}

export const isGoogleDriveAccessTokenValid = async () => {
    const accessToken = await fetchGoogleDriveAccessToken();
    if (!accessToken) {
        return false;
    }
    const tokenExpiry = await getStoredGoogleDriveTokenExpiry();
    const currentTime = Date.now();
    if (tokenExpiry && currentTime >= tokenExpiry) {
        return false;
    }
    return true;
}

export const getGoogleDriveFiles = async (pageToken?: string) => {
    const accessToken = await fetchGoogleDriveAccessToken();
    if (!accessToken) {
    console.log('No access token found.');
    return null;
    }

    const tokenExpiry = await getStoredGoogleDriveTokenExpiry();
    const currentTime = Date.now();
    if (tokenExpiry && currentTime >= tokenExpiry) {
    console.log('Access token has expired. Use refresh token to get a new access token.');
    return null;
    }

    const urlParams = new URLSearchParams();
    urlParams.append('pageSize', '5');
    urlParams.append('fields', 'nextPageToken, files(id,name,mimeType,modifiedTime)');
    urlParams.append('q', "mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'");
    if (pageToken) {
    urlParams.append('pageToken', pageToken);
    }

    const files = await fetch(`https://www.googleapis.com/drive/v3/files?${urlParams.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    });

    const response = await files.json();

    return response;
};

export const fetchGoogleDocAsPdfAndCreateTempFile = async (fileId: string, fileName: string, fileMimeType: string) => {
    const accessToken = await fetchGoogleDriveAccessToken();
    if (!accessToken) {
        console.log('No access token found.');
        return null;
    }

    const exportUrl = fileMimeType === "application/vnd.google-apps.document"
        ? `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`
        : `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    console.log('Export URL:', exportUrl);
    const destination = new Directory(Paths.cache, 'googleDriveDownloads');
    if (!destination.exists) {
        console.log('Creating directory for Google Drive downloads at:', destination.uri);
        destination.create();
        console.log('Created directory at:', destination.uri);
    }
    const file = new File(destination, `${fileName}.pdf`);
    if (file.exists) {
        console.log('File already exists at:', file.uri);
        file.delete()
    }
    const fileUri = file.uri;
    console.log('Downloading Google Doc to:', fileUri);
    try {
        const downloadUri = await File.downloadFileAsync(exportUrl, file, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }); 
        console.log('Download Google Doc Response Status:', downloadUri);
        return file;
    } catch (error) {
        console.error('Error downloading Google Doc as PDF:', error);
        return null
    }

}

export const useRefreshTokenToGetNewAccessToken = async () => {
    const refreshToken = await getStoredGoogleDriveRefreshToken();
    if (!refreshToken) {
        console.log('No refresh token found.');
        return null;
    }
}

// Dropbox OAuth
export const connectToDropboxOAuth = async () => {
    const CLIENT_ID = 'y5p2hr089nvhqz6';
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'com.syedwajihrizvi.JobeeFrontEnd',
        path: 'redirect'
    })
    const DISCOVERY = {
        authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
        tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token'
    }
    const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scopes: ['files.metadata.read', 'files.content.read'],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true
    })
    const result = await request.promptAsync(DISCOVERY);
    const {codeVerifier} = request
    if (result.type === 'success' && codeVerifier) {
        const { code } = result.params
        const tokens = await exchangeDropboxOAuthCodeForToken(code, codeVerifier);
        return tokens;
    }
    return null;
}

export const exchangeDropboxOAuthCodeForToken = async (code: string, codeVerifier: string) => {
    const CLIENT_ID = 'y5p2hr089nvhqz6';
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'com.syedwajihrizvi.JobeeFrontEnd', 
        path: 'redirect'
    });
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('code', code);
    params.append('code_verifier', codeVerifier);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('grant_type', 'authorization_code');
    const queryParams = params.toString();
    console.log('Dropbox Token Request Params:', queryParams);
    const response = await fetch(`https://api.dropboxapi.com/oauth2/token?${queryParams}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    const data = await response.json();
    const { access_token, expires_in, account_id } = data
    const res = await storeDropBoxTokensOnDevice({
        accessToken: access_token,
        expiresIn: expires_in,
        accountId: account_id
    })
    if (!res) {
        return null;
    }
    console.log('Dropbox Token Response:', data);
    return true;
}

export const storeDropBoxTokensOnDevice = async ({accessToken, expiresIn, accountId}: {
    accessToken: string;
    expiresIn: number;
    accountId: string;
}) => {
    const storedAt = Date.now();
    const expiresAt = storedAt + expiresIn * 1000;
    try {
        await SecureStore.setItemAsync('dropboxAccessToken', accessToken);
        await SecureStore.setItemAsync('dropboxExpiresIn', expiresIn.toString());
        await SecureStore.setItemAsync('dropboxStoredAt', storedAt.toString());
        await SecureStore.setItemAsync('dropboxExpiresAt', expiresAt.toString());
        await SecureStore.setItemAsync('dropboxAccountId', accountId);
        return true;
    } catch (error) {
        console.error('Error storing Dropbox tokens:', error);
        return false;
    }
}

export const fetchDropboxAccessToken = async () => {
    const accessToken = await SecureStore.getItemAsync('dropboxAccessToken');
    return accessToken;
}

export const getStoredDropboxTokenExpiry = async () => {
    const expiresAt = await SecureStore.getItemAsync('dropboxExpiresAt');
    return expiresAt ? parseInt(expiresAt, 10) : null;
}

export const clearStoredDropboxTokens = async () => {
    await SecureStore.deleteItemAsync('dropboxAccessToken');
    await SecureStore.deleteItemAsync('dropboxExpiresIn');
    await SecureStore.deleteItemAsync('dropboxStoredAt');
    await SecureStore.deleteItemAsync('dropboxExpiresAt');
    await SecureStore.deleteItemAsync('dropboxAccountId');
}

export const isDropboxAccessTokenValid = async () => {
    const accessToken = await fetchDropboxAccessToken();
    if (!accessToken) {
        return false;
    }
    const tokenExpiry = await getStoredDropboxTokenExpiry();
    const currentTime = Date.now();
    if (tokenExpiry && currentTime >= tokenExpiry) {
        return false;
    }
    return true;
}

export const getDropBoxFiles = async () => {
    const accessToken = await fetchDropboxAccessToken();
    if (!accessToken) {
        console.log('No Dropbox access token found.');
        return null;
    }
    const requestBody = JSON.stringify({
        path: "",
        recursive: false,
        include_deleted: false,
        limit: 20
    })
    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: requestBody
    });
    console.log(response)
    console.log(requestBody)
    if (response.ok) {
        const data = await response.json();
        console.log('Dropbox Files Response:', data);
        return data;
    }
    const errorText = await response.text();
    console.error(`Dropbox API Error (${response.status}): ${errorText}`);
    console.error('Request Body Sent:', requestBody);
    return null; 
}

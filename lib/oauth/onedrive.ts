import { OneDriveFile } from "@/type";
import * as AuthSession from 'expo-auth-session';
import { Directory, File, Paths } from "expo-file-system";
import * as SecureStore from 'expo-secure-store';

export const connectToOneDriveOAuth = async (type: 'common' | 'organizations' = 'common') => {
    const CLIENT_ID = '055caa21-84fa-47d0-865b-05f5999fe8ec'
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'com.syedwajihrizvi.JobeeFrontEnd',
        path: 'redirect'
    })
    const DISCOVERY = {
        authorizationEndpoint: `https://login.microsoftonline.com/${type}/oauth2/v2.0/authorize`,
        tokenEndpoint: `https://login.microsoftonline.com/${type}/oauth2/v2.0/token`,
    };

    const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scopes: ['Files.Read', 'User.Read', 'Files.ReadWrite.All', "OnlineMeetings.ReadWrite", "offline_access"],
        responseType: AuthSession.ResponseType.Code
    })

    const result = await request.promptAsync(DISCOVERY);
    const { codeVerifier } = request
    if (result.type === 'success' && codeVerifier) {
        const { code} = result.params
        const tokens = await exchangeOneDriveOAuthCodeForToken(code, codeVerifier, type);
        return tokens;
    }
}

export const exchangeOneDriveOAuthCodeForToken = async (code: string, codeVerifier: string, type: 'common' | 'organizations' = 'common') => {
    const CLIENT_ID = '055caa21-84fa-47d0-865b-05f5999fe8ec'
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'com.syedwajihrizvi.JobeeFrontEnd',
        path: 'redirect'
    })
    const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${type}/oauth2/v2.0/token`
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        scope: 'Files.Read User.Read Files.ReadWrite.All OnlineMeetings.ReadWrite offline_access',
    })
    try {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        const data = await response.json();
        console.log('OneDrive OAuth Token Response:', data);
        const { access_token, expires_in, refresh_token } = data
        console.log("OneDrive Access Token:", access_token);
        const res = await storeOneDriveTokensOnDevice({
            accessToken: access_token,
            expiresIn: expires_in,
            refreshToken: refresh_token
        })
        if (!res) {
            return null;
        }
        return true;
    } catch (error) {
        console.log('Error exchanging OneDrive OAuth code for token:', error);
        return null;
    }
}

export const storeOneDriveTokensOnDevice = async ({accessToken, expiresIn, refreshToken}: {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}) => {
    const storedAt = Date.now();
    const expiresAt = storedAt + expiresIn * 1000;
    try {
        await SecureStore.setItemAsync('oneDriveAccessToken', accessToken);
        await SecureStore.setItemAsync('oneDriveExpiresIn', expiresIn.toString());
        await SecureStore.setItemAsync('oneDriveStoredAt', storedAt.toString());
        await SecureStore.setItemAsync('oneDriveExpiresAt', expiresAt.toString());
        await SecureStore.setItemAsync('oneDriveRefreshToken', refreshToken);
        return true;
    } catch (error) {
        console.error('Error storing OneDrive tokens:', error);
        return false;
    }
}

export const fetchOneDriveAccessToken = async () => {
    const accessToken = await SecureStore.getItemAsync('oneDriveAccessToken');
    return accessToken;
}

export const getStoredOneDriveRefreshToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('oneDriveRefreshToken');
    return refreshToken;
}

export const getStoredOneDriveTokenExpiry = async () => {
    const expiresAt = await SecureStore.getItemAsync('oneDriveExpiresAt');
    return expiresAt ? parseInt(expiresAt, 10) : null;
}

export const clearStoredOneDriveTokens = async () => {
    await SecureStore.deleteItemAsync('oneDriveAccessToken');
    await SecureStore.deleteItemAsync('oneDriveExpiresIn');
    await SecureStore.deleteItemAsync('oneDriveStoredAt');
    await SecureStore.deleteItemAsync('oneDriveExpiresAt');
}

export const isMicrosoftTokenValid = async () => {
    const accessToken = await fetchOneDriveAccessToken();
    if (!accessToken) {
        return false;
    }
    const tokenExpiry = await getStoredOneDriveTokenExpiry();
    const currentTime = Date.now();
    if (tokenExpiry && currentTime >= tokenExpiry) {
        return false;
    }
    return true;
}

export const getOneDriveFiles = async (folderPath?: string, nextLink?: string) => {
    const accessToken = await fetchOneDriveAccessToken();
    if (!accessToken) {
        console.log('No OneDrive access token found.');
        return null;
    }

    let drivePath: string;
    if (folderPath && folderPath !== "/") {
        const encodedPath = encodeURIComponent(folderPath);
        drivePath = `root:${encodedPath}:/children`;
    } else {
        drivePath = 'root/children';
    }
    const baseUrl = `https://graph.microsoft.com/v1.0/me/drive/${drivePath}?$top=5`;
    const url = nextLink ? nextLink : baseUrl;
    try {
        const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (response.ok) {
        const data = await response.json();
        return {files: data.value as OneDriveFile[], nextLink: data['@odata.nextLink']};
    }
    return null; 
    } catch (error) {
        console.log('Error fetching OneDrive files:', error);
    }
}

export const fetchOneDriveFileAsPdfAndCreateTempFile = async (downloadUrl: string, fileName: string) => {
    const accessToken = await fetchOneDriveAccessToken();
    if (!accessToken) {
        console.log('No OneDrive access token found.');
        return null;
    }

    const destination = new Directory(Paths.cache, 'oneDriveDownloads');
    if (!destination.exists) {
        console.log('Creating directory for OneDrive downloads at:', destination.uri);
        destination.create();
        console.log('Created directory at:', destination.uri);
    }

    const file = new File(destination, `${fileName}`);
    if (file.exists) {
        console.log('File already exists at:', file.uri);
        file.delete()
    }
    try {
        const downloadUri = await File.downloadFileAsync(downloadUrl, file);
        console.log('Download OneDrive File Response Status:', downloadUri);
        return file;
    } catch (error) {
        console.log('Error downloading OneDrive file:', error);
        return null;
    }
}

export const refreshMicrosoftToken = async (type: 'common' | 'organizations' = 'common') => {
    const refreshToken = await getStoredOneDriveRefreshToken();
    if (!refreshToken) {
        return null;
    }
    try {
        const CLIENT_ID = '055caa21-84fa-47d0-865b-05f5999fe8ec'
        const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${type}/oauth2/v2.0/token`
        const body = new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            scope: 'Files.Read User.Read Files.ReadWrite.All OnlineMeetings.ReadWrite offline_access',
        })
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        const data = await response.json();
        const { access_token, expires_in, refresh_token } = data
        const res = await storeOneDriveTokensOnDevice({
            accessToken: access_token,
            expiresIn: expires_in,
            refreshToken: refresh_token
        })
        if (!res) {
            return null;
        }
        return true;
    } catch (error) {
        console.log('Error refreshing Microsoft access token:', error);
        return null;
    }
}

export const createTeamsMeeting = async () => {
    await userHasTeamsLicense();
    const accessToken = await fetchOneDriveAccessToken();
    console.log("OneDrive Access Token:", accessToken);
    if (!accessToken) {
        console.log('No OneDrive access token found.');
        return null;
    }
    const res = await fetch("https://graph.microsoft.com/v1.0/me/onlineMeetings", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            startDateTime: "2024-10-01T14:30:00Z",
            endDateTime: "2024-10-01T15:00:00Z",
            subject: "Jobee Scheduled Meeting",
            participants: {
                organizer: {
                    identity: { user: { id: "me"}}
                },
                attendees: [
                    {
                        identity: { user: { id: "candidateemail@example.com"}},
                        role: "attendee"
                    },
                    {
                        identity: { user: { id: "worker@example.com"}},
                        role: "attendee"
                    }
                ]
            }
        })
    });
    const response = await res.json();
    console.log(response)
}

export const userHasTeamsLicense = async () => {
    const accessToken = await fetchOneDriveAccessToken();
    const response = await fetch("https://graph.microsoft.com/v1.0/me/licenseDetails", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    if (!data || !data.value || data.value.length === 0) {
        return false;
    }
    const { servicePlans} = data.value[0]
    servicePlans.forEach((plan: any) => {
        if (plan.servicePlanName.toUpperCase().includes("TEAMS") && plan.provisioningStatus === "Success") {
            return true;
        }
    })
    return false
}
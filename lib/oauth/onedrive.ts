import { OneDriveFile } from "@/type";
import * as AuthSession from 'expo-auth-session';
import { Directory, File, Paths } from "expo-file-system";
import * as SecureStore from 'expo-secure-store';

export const connectToOneDriveOAuth = async () => {
    const CLIENT_ID = '055caa21-84fa-47d0-865b-05f5999fe8ec'
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'com.syedwajihrizvi.JobeeFrontEnd',
        path: 'redirect'
    })
    const DISCOVERY = {
        authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    };

    const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scopes: ['Files.Read', 'User.Read', 'Files.ReadWrite.All'],
        responseType: AuthSession.ResponseType.Code
    })

    const result = await request.promptAsync(DISCOVERY);
    console.log('OneDrive OAuth Result:', result);
    const { codeVerifier } = request
    if (result.type === 'success' && codeVerifier) {
        const { code} = result.params
        const tokens = await exchangeOneDriveOAuthCodeForToken(code, codeVerifier);
        console.log(tokens)
        return tokens;
    }
}

export const exchangeOneDriveOAuthCodeForToken = async (code: string, codeVerifier: string) => {
    const CLIENT_ID = '055caa21-84fa-47d0-865b-05f5999fe8ec'
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'com.syedwajihrizvi.JobeeFrontEnd',
        path: 'redirect'
    })
    const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        scope: 'Files.Read User.Read Files.ReadWrite.All',
    })
    console.log('OneDrive Token Request Params:', body.toString());
    try {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        console.log('OneDrive Token Response Status:', response);
        const data = await response.json();
        const { access_token, expires_in} = data
        const res = await storeOneDriveTokensOnDevice({
            accessToken: access_token,
            expiresIn: expires_in
        })
        if (!res) {
            return null;
        }
        console.log('OneDrive Token Response:', data);
        return true;
    } catch (error) {
        console.log('Error exchanging OneDrive OAuth code for token:', error);
        return null;
    }
}

export const storeOneDriveTokensOnDevice = async ({accessToken, expiresIn}: {
    accessToken: string;
    expiresIn: number;
}) => {
    console.log('Storing OneDrive tokens:', { accessToken, expiresIn });
    const storedAt = Date.now();
    const expiresAt = storedAt + expiresIn * 1000;
    try {
        await SecureStore.setItemAsync('oneDriveAccessToken', accessToken);
        await SecureStore.setItemAsync('oneDriveExpiresIn', expiresIn.toString());
        await SecureStore.setItemAsync('oneDriveStoredAt', storedAt.toString());
        await SecureStore.setItemAsync('oneDriveExpiresAt', expiresAt.toString());
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

export const isOneDriveAccessTokenValid = async () => {
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
    console.log('Fetching OneDrive files. Next link:', nextLink);
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
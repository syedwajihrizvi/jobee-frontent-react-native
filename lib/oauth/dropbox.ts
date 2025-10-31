import { DropboxFile } from '@/type';
import * as AuthSession from 'expo-auth-session';
import { Directory, File, Paths } from "expo-file-system";
import * as SecureStore from 'expo-secure-store';

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

export const getDropBoxFiles = async (cursor?: string, folderPath?: string) => {
    const accessToken = await fetchDropboxAccessToken();
    if (!accessToken) {
        console.log('No Dropbox access token found.');
        return null;
    }
    if (folderPath === '/') {
        folderPath = '';
    }
    const finalPath = folderPath || '';
    const url = cursor ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : 'https://api.dropboxapi.com/2/files/list_folder';
    const requestBody = cursor ? JSON.stringify({ cursor }) : JSON.stringify({
        path: finalPath,
        recursive: false,
        include_deleted: false,
        limit: 5
    })
    console.log('Dropbox Files Request Body:', requestBody);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: requestBody
    });
    if (response.ok) {
        const data = await response.json();
        console.log('Dropbox Files Response:', data);
        return data as {cursor: string, hasMore: boolean, entries: DropboxFile[]};
    }
    return null; 
}

export const fetchDropboxFileAsPdfAndCreateTempFile = async (
    fileId: string, fileName: string, fileMimeType: string, filePath: string) => {
    const accessToken = await fetchDropboxAccessToken();
    if (!accessToken) {
        console.log('No Dropbox access token found.');
        return null;
    }
    const downloadUrl = 'https://content.dropboxapi.com/2/files/download';
    const body = {
        path: fileId
    };
    console.log('Dropbox File Download Body:', body);
    const destination = new Directory(Paths.cache, 'dropboxDownloads');
    if (!destination.exists) {
        console.log('Creating directory for Dropbox downloads at:', destination.uri);
        destination.create();
        console.log('Created directory at:', destination.uri);
    }

    const file = new File(destination, `${fileName}`);
    if (file.exists) {
        console.log('File already exists at:', file.uri);
        file.delete()
    }
    const fileUri = file.uri;
    console.log('Downloading Dropbox File to:', fileUri);
    try {
        const downloadUri = await File.downloadFileAsync(downloadUrl, file, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify(body),
            },
        });
        console.log('Download Dropbox File Response:', downloadUri);
        console.log('Download Dropbox File Response Status:', downloadUri);
        return file;
    } catch (error) {
        console.log('Error downloading Dropbox file as PDF:', error);
        return null;
    }
}
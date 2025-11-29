import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

const CLIENT_ID = "C75014ec6db077b54111613a2bdb1d594367c433153b69def38b6fc94ec92727a"
const CLIENT_SECRET = '1d6b0b7b2b36bea517712e738d6cb1fa80f792bf28e65958162a8d7f3a9bbd58'
const REDIRECT_URI = "https://dauntless-aron-unprobationary.ngrok-free.dev/oauth2/webex-redirect"

export const connectToWebexOAuth = async () => {
    const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        scopes: ['meeting:schedules_write', 'meeting:schedules_read', 'spark:people_read'],
        usePKCE: true,
    })

    const result = await request.promptAsync({
        authorizationEndpoint: `https://webexapis.com/v1/authorize`,
    })
    if (result.type === 'success' && request.codeVerifier) {
        const { code } = result.params
        const tokens = await exchangeWebexOAuthCodeForToken(code, request.codeVerifier)
        return tokens;
    }
    return null;
}

export const exchangeWebexOAuthCodeForToken = async (code: string, codeVerifier: string) => {
    const tokens = await fetch("https://webexapis.com/v1/access_token", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:bEC7sq67EoH5UPtXxUEaZUvwUtgWpHYj`)
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code_verifier: codeVerifier
        }).toString()
    });
    const data = await tokens.json();
    const { access_token, expires_in, refresh_token, refesh_token_expires_in } = data
    const res = await storeWebexTokensOnDevice({
        accessToken: access_token,
        expiresIn: expires_in,
        refreshToken: refresh_token,
        refreshTokenExpiresIn: refesh_token_expires_in
    })
    if (!res) {
        return null;
    }
    return true;
}

export const storeWebexTokensOnDevice = async ({accessToken, expiresIn, refreshToken, refreshTokenExpiresIn}: {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    refreshTokenExpiresIn: number;
}) => {
    const storedAt = Date.now();
    const expiresAt = storedAt + expiresIn * 1000;
    const refreshTokenExpiresAt = storedAt + refreshTokenExpiresIn * 1000;
    try {
        await SecureStore.setItemAsync('webex_access_token', accessToken);
        await SecureStore.setItemAsync('webex_expires_at', expiresAt.toString());
        await SecureStore.setItemAsync('webex_refresh_token', refreshToken);
        await SecureStore.setItemAsync('webex_refresh_token_expires_at', refreshTokenExpiresAt.toString());
        return true;
    } catch (error) {
        console.log("Error storing Webex tokens on device:", error);
        return false;
    }
}

export const fetchWebexAccessToken = async () => {
    const accessToken = await SecureStore.getItemAsync('webex_access_token');
    return accessToken;
}

export const fetchWebexRefreshToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('webex_refresh_token');
    return refreshToken;
}

export const fetchRefreshTokenExpiry = async () => {
    const refreshTokenExpiresAtStr = await SecureStore.getItemAsync('webex_refresh_token_expires_at');
    if (!refreshTokenExpiresAtStr) {
        return null;
    }
    return parseInt(refreshTokenExpiresAtStr, 10);
}

export const getStoredWebexTokenExpiry = async () => {
    const expiresAtStr = await SecureStore.getItemAsync('webex_expires_at');
    if (!expiresAtStr) {
        return null;
    }
    return parseInt(expiresAtStr, 10);
}

export const isWebexTokenValid = async () => {
    const accessToken = await fetchWebexAccessToken();
    if (!accessToken) {
        return false;
    }
    const expiresAt = await getStoredWebexTokenExpiry();
    if (!expiresAt) {
        return false;
    }
    const now = Date.now();
    return now < expiresAt;
}

export const refreshWebexToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('webex_refresh_token');
    if (!refreshToken) {
        return null;
    }
    const refreshTokenExpiry = await fetchRefreshTokenExpiry();
    if (!refreshTokenExpiry || Date.now() >= refreshTokenExpiry) {
        return null;
    }
    try {
        const response = await fetch("https://webexapis.com/v1/access_token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:bEC7sq67EoH5UPtXxUEaZUvwUtgWpHYj`)
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            }).toString()
        });
        const data = await response.json();
        const { access_token, expires_in, refresh_token, refesh_token_expires_in } = data
        const res = await storeWebexTokensOnDevice({
            accessToken: access_token,
            expiresIn: expires_in,
            refreshToken: refresh_token,
            refreshTokenExpiresIn: refesh_token_expires_in
        })
        if (!res) {
            return null;
        }
        return true;
    } catch (error) {
        console.log('Error refreshing Webex token:', error);
        return null;
    }
}

export const clearStoredWebexTokens = async () => {
    await SecureStore.deleteItemAsync('webex_access_token');
    await SecureStore.deleteItemAsync('webex_expires_at');
    await SecureStore.deleteItemAsync('webex_refresh_token');
    await SecureStore.deleteItemAsync('webex_refresh_token_expires_at');
}

export const createWebexMeeting = async () => {
    const accessToken = await fetchWebexAccessToken();
    const response = await fetch("https://webexapis.com/v1/meetings", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            title: "Test New Meeting",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes later
        })
    });
    const data = await response.json();
    console.log(data)
    return data;
}

export const fetchWebexUserDetails = async () => {
    const accessToken = await fetchWebexAccessToken();
    const response = await fetch("https://webexapis.com/v1/people/me", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    return data
}

export const doesUserHaveLicenseToCreateMeeting = async () => {
    const userDetails = await fetchWebexUserDetails();
    if (userDetails.licenses == null) {
        return false
    }
    const { licenses } = userDetails;
    if (licenses.includes('MC') || licenses.includes('SD') || licenses.includes('M3')) {
        return true;
    }
    return false;
}
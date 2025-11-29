import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

    const CLIENT_ID = "vZpkSm4wTcecLmDo2xMjdQ";
    const REDIRECT_URI = "https://dauntless-aron-unprobationary.ngrok-free.dev/oauth2/zoom-redirect"

export const connectToZoomOAuth = async () => {

    const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
    })
    const result = await request.promptAsync({
        authorizationEndpoint: `https://zoom.us/oauth/authorize`,
    })
    if (result.type === 'success' && request.codeVerifier) {
        const { code } = result.params
        const tokens = await exhangeZoomOAuthCodeForToken(code, request.codeVerifier);
        return tokens;
    }
    return null;
};

export const exhangeZoomOAuthCodeForToken = async (code: string, codeVerifier: string) => {
        const tokens = await fetch("https://zoom.us/oauth/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:bEC7sq67EoH5UPtXxUEaZUvwUtgWpHYj`)
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier
            }).toString()
        });
        const data = await tokens.json();
        const { access_token, expires_in, refresh_token } = data
        const res = await storeZoomTokensOnDevice({
            accessToken: access_token,
            expiresIn: expires_in,
            refreshToken: refresh_token
        })
        if (!res) {
            return null;
        }
        return true;
}

export const storeZoomTokensOnDevice = async ({accessToken, expiresIn, refreshToken}: {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}) => {
    const storedAt = Date.now();
    const expiresAt = storedAt + expiresIn * 1000;
    try {
        await SecureStore.setItemAsync('zoomAccessToken', accessToken);
        await SecureStore.setItemAsync('zoomRefreshToken', refreshToken);
        await SecureStore.setItemAsync('zoomExpiresIn', expiresIn.toString());
        await SecureStore.setItemAsync('zoomStoredAt', storedAt.toString());
        await SecureStore.setItemAsync('zoomExpiresAt', expiresAt.toString());
        return true;
    } catch (error) {
        console.error('Error storing Zoom tokens:', error);
        return false;
    }
}

export const isZoomAccessTokenValid = async () => {
    const accessToken = await fetchZoomAccessToken();
    if (!accessToken) {
        return false;
    }
    const expiresAt = await getStoredZoomTokenExpiry();
    if (!expiresAt) {
        return false;
    }
    const now = Date.now();
    return now < expiresAt;
}

export const fetchZoomAccessToken = async () => {
    const accessToken = await SecureStore.getItemAsync('zoomAccessToken');
    return accessToken;
}

export const fetchZoomRefreshToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('zoomRefreshToken');
    return refreshToken;
}

export const getStoredZoomTokenExpiry = async () => {
    const expiresAt = await SecureStore.getItemAsync('zoomExpiresAt');
    return expiresAt ? parseInt(expiresAt, 10) : null;
}

export const clearStoredZoomTokens = async () => {
    await SecureStore.deleteItemAsync('zoomAccessToken');
    await SecureStore.deleteItemAsync('zoomRefreshToken');
    await SecureStore.deleteItemAsync('zoomExpiresIn');
    await SecureStore.deleteItemAsync('zoomStoredAt');
    await SecureStore.deleteItemAsync('zoomExpiresAt');
}

export const refreshZoomAccessToken = async () => {
    const refreshToken = await fetchZoomRefreshToken();
    if (!refreshToken) {
        return null;
    }
    try {
        const result = await fetch("https://zoom.us/oauth/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:bEC7sq67EoH5UPtXxUEaZUvwUtgWpHYj`)
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }).toString()
        })
        const data = await result.json();
        const { access_token, expires_in, refresh_token } = data
        const res = await storeZoomTokensOnDevice({
            accessToken: access_token,
            expiresIn: expires_in,
            refreshToken: refresh_token
        })
        if (!res) {
            return null;
        }
        return true;
    } catch (error) {
        console.log('Error refreshing Zoom access token:', error);
        return null;
    }

}

export const createZoomMeeting = async () => {
    const accessToken = await fetchZoomAccessToken();
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            topic: "New Meeting",
            type: 1
        })
    });
    const data = await response.json();
    console.log("Zoom Meeting Created:", data);
}   
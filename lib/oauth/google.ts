// TODO: Update name of the file

import { GoogleDriveFile } from '@/type';
import * as AuthSession from 'expo-auth-session';
import { Directory, File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { combineDateAndTime, convertTimeZoneToIANA, convertToUTCDateString } from '../utils';

const google_client_id = `${process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID}.apps.googleusercontent.com`;
const redirect_uri = `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID}:/oauthredirect`

export const connectToGoogleDriveOAuth = async () => {
    const REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: redirect_uri
    });
    const DISCOVERY = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };
    
    const request = new AuthSession.AuthRequest({
        clientId: google_client_id,
        redirectUri: REDIRECT_URI,
        scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar','profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
            access_type: 'offline',
            prompt: 'consent',
        }
    });
    const result = await request.promptAsync(DISCOVERY);
    const { codeVerifier } = request
    const successful = result.type === 'success';
    if (successful && codeVerifier) {
        const {code} =  result.params
        const tokens = await exhchangeGoogleOAuthCodeForToken(code, codeVerifier);
        return tokens;
    }
    return null;
}

export const exhchangeGoogleOAuthCodeForToken = async (code: string, codeVerifier: string) => {
    const REDIRECT_URI = AuthSession.makeRedirectUri({
         scheme: redirect_uri
    });
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('code_verifier', codeVerifier);
    params.append('client_id', google_client_id);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('grant_type', 'authorization_code');
    const queryParams = params.toString();
    const response = await fetch(`https://oauth2.googleapis.com/token?${queryParams}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    const data = await response.json();
    const { access_token, refresh_token, expires_in, id_token, refresh_token_expires_in } = data;
    console.log('Google OAuth Token Data:', data);
    const res = await storeGoogleTokensOnDevice({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        idToken: id_token,
        refreshTokenExpiresIn: refresh_token_expires_in
    })
    if (!res) {
        return null
    } 
    const tokenInfo = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`);
    await tokenInfo.json();
    return true;
}

export const storeGoogleTokensOnDevice = async ({accessToken, refreshToken, expiresIn, idToken, refreshTokenExpiresIn}: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    idToken: string;
    refreshTokenExpiresIn: number;
}) => {
    const storedAt = Date.now();
    const expiresAt = storedAt + expiresIn * 1000;
    try {
        await SecureStore.setItemAsync('googleDriveAccessToken', accessToken);
        await SecureStore.setItemAsync('googleDriveRefreshToken', refreshToken);
        await SecureStore.setItemAsync('googleDriveExpiresIn', expiresIn.toString());
        await SecureStore.setItemAsync('googleDriveStoredAt', storedAt.toString());
        await SecureStore.setItemAsync('googleDriveExpiresAt', expiresAt.toString());
        await SecureStore.setItemAsync('googleDriveRefreshTokenExpiresIn', refreshTokenExpiresIn.toString());
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

export const isGoogleDriveRefreshTokenValid = async () => {
    const refreshToken = await getStoredGoogleDriveRefreshToken();
    if (!refreshToken) {
        return false;
    }
    const refreshTokenExpiryStr = await SecureStore.getItemAsync('googleDriveRefreshTokenExpiresIn');
    if (!refreshTokenExpiryStr) {
        return false;
    }
    const refreshTokenExpiry = parseInt(refreshTokenExpiryStr, 10);
    const storedAtStr = await SecureStore.getItemAsync('googleDriveStoredAt');
    if (!storedAtStr) {
        return false;
    }
    const storedAt = parseInt(storedAtStr, 10);
    const refreshTokenExpiresAt = storedAt + refreshTokenExpiry * 1000;
    const currentTime = Date.now();
    if (currentTime >= refreshTokenExpiresAt) {
        return false;
    }
    return true;
}

export const getGoogleDriveFiles = async (pageToken?: string, folderId?: string) => {
    const accessToken = await fetchGoogleDriveAccessToken();
    if (!accessToken) {
    return null;
    }

    const tokenExpiry = await getStoredGoogleDriveTokenExpiry();
    const currentTime = Date.now();
    if (tokenExpiry && currentTime >= tokenExpiry) {
    return null;
    }

    const urlParams = new URLSearchParams();
    urlParams.append('pageSize', '5');
    urlParams.append('fields', 'nextPageToken, files(id,name,mimeType,modifiedTime, size)');
    if (folderId) {
    urlParams.append('q', `'${folderId}' in parents and trashed = false`);
    }
    if (pageToken) {
    urlParams.append('pageToken', pageToken);
    }
    const files = await fetch(`https://www.googleapis.com/drive/v3/files?${urlParams.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    });

    const response = await files.json();
    return response as { nextPageToken: string; files: GoogleDriveFile[] };
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

export const refreshGoogleToken = async () => {
    const refreshToken = await getStoredGoogleDriveRefreshToken();
    if (!refreshToken) {
        console.log('No refresh token found.');
        return null;
    }
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: google_client_id,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }).toString(),
        });
        if (response.status !== 200) {
            console.log('Failed to refresh token, status code:', response.status);
            return null;
        }
        const data = await response.json();
        const { access_token, expires_in, id_token, refresh_token_expires_in } = data;
        const res = await storeGoogleTokensOnDevice({
            accessToken: access_token,
            refreshToken: refreshToken,
            expiresIn: expires_in,
            idToken: id_token,
            refreshTokenExpiresIn: refresh_token_expires_in
        })
        if (!res) {
            return null;
        }
        return true;
    } catch (error) {
        console.log('Error refreshing Google Drive access token:', error);
        return null;
    }
}

export const createGoogleCalendarEvent = async (
{summary, description, startTime, endTime, 
meetingDate, timezone, attendees}:
        {summary: string; description: string; startTime: string; endTime: string; 
            meetingDate: string; timezone: string; attendees: {email: string}[];}
) => {
    const accessToken = await fetchGoogleDriveAccessToken() ;
    if (!accessToken) {
        console.log('No access token found.');
        return null;
    }
    const IANATimezone = convertTimeZoneToIANA(timezone);
    const start = combineDateAndTime(meetingDate, startTime);
    const end = combineDateAndTime(meetingDate, endTime);
    const body = JSON.stringify({
            summary,
            description,
            start: {
                dateTime: start,
                timeZone: IANATimezone,
            },
            end: {
                dateTime: end,
                timeZone: IANATimezone,
            },
            attendees: attendees.map(a => ({
                email: a.email,
                responseStatus: "needsAction",
            })),
            conferenceDataVersion: 1,
            conferenceData: {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                },
            },
            reminders: {
                useDefault: true,
            }
        })
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body,
    });
    console.log('Create Google Calendar Event Response Status:', response);
    if (response.status !== 200) {
        return null;
    }
    const meeting = await response.json();
    const hangoutLink = meeting.hangoutLink || null;
    const meetingId = meeting.conferenceData?.conferenceId || null;
    const eventId = meeting.id || null;
    console.log('Created Google Calendar Event:', meeting);
    if (!hangoutLink) {
        return null;
    }
    const data = {
        meetingId,
        hangoutLink,
        eventId,
    }
    return data;
}

export const checkGoogleCalendarEventConflict = async (
    startTime: string,
    endTime: string,
    meetingDate: string,
    timezone: string
) => {
    const accessToken = await fetchGoogleDriveAccessToken() ;
    if (!accessToken) {
        console.log('No access token found.');
        return null;
    }
    const start = convertToUTCDateString(startTime, meetingDate, timezone);
    const end = convertToUTCDateString(endTime, meetingDate, timezone);
    const body = JSON.stringify({
            timeMin: start,
            timeMax: end,
            items: [{ id: 'primary' }],
        }).toString()
    const response = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body
    })
    const data = await response.json();
    if (!data.calendars || !data.calendars.primary) {
        return false;
    }
    const busyTimes = data.calendars.primary.busy;
    return busyTimes.length > 0;
}

export const deleteGoogleCalendarEvent = async (eventId: string, sendUpdates: boolean = true) => {
    const accessToken = await fetchGoogleDriveAccessToken();
    if (!accessToken) {
        return false;
    }
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=${sendUpdates ? 'all' : 'none'}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return response.status === 204;
}

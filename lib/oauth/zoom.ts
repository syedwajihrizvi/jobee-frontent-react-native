import { ZoomMeetingCreationResult } from '@/type';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { combineDateAndTime, convertTimeZoneToIANA, getDurationInMinutes } from '../utils';

    const ZOOM_CLIENT_ID = process.env.EXPO_PUBLIC_ZOOM_CLIENT_ID || '';
    const REDIRECT_URI = `${process.env.EXPO_PUBLIC_NGROK_URL}/oauth2/zoom-redirect`

export const connectToZoomOAuth = async () => {

    const request = new AuthSession.AuthRequest({
        clientId: ZOOM_CLIENT_ID,
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
                'Authorization': 'Basic ' + btoa(`${ZOOM_CLIENT_ID}:bEC7sq67EoH5UPtXxUEaZUvwUtgWpHYj`)
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
                'Authorization': 'Basic ' + btoa(`${ZOOM_CLIENT_ID}:bEC7sq67EoH5UPtXxUEaZUvwUtgWpHYj`)
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

export const createZoomMeeting = async (
    title: string,
    agenda: string,
    selectedDate: string,
    startTime: string, 
    endTime: string, timezone: string,
    invitees: {email: string, fullName: string}[]) : Promise<ZoomMeetingCreationResult | null> => {
    const accessToken = await fetchZoomAccessToken();
    
    const fromTime = combineDateAndTime(selectedDate, startTime);
    const toTime = combineDateAndTime(selectedDate, endTime);
    const duration = getDurationInMinutes(fromTime, toTime, timezone);
    const IANATimezone = convertTimeZoneToIANA(timezone);
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            topic: title,
            agenda: agenda,
            type: 2,
            start_time: fromTime,
            duration: duration,
            timezone: IANATimezone,
            settings: {
                approval_type: 0,
                registration_type: 1,
            }
        })
    });
    const meeting = await response.json();
    if (!meeting.id) {
        return null;
    }
    const isFree = await isFreeAccount();
    const res = {
            meetingId: meeting.id,
            startUrl: meeting.start_url,
            joinUrl: meeting.join_url, 
            meetingPassword: meeting.password,
            timezone: meeting.timezone,
            registrants: [] as {email: string; joinUrl: string}[],
            needToSendEmailInvites: !isFree,   
    }
    if (!isFree) {
        const registrantJoinLinks : {email: string; joinUrl: string}[] = [];
        const registrantsPromises = invitees.map(async (invitee) => {
            const { email, fullName } = invitee;
            const firstName = fullName.split(' ')[0];
            const response = await fetch(`https://api.zoom.us/v2/meetings/${meeting.id}/registrants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    email: email,
                    first_name: firstName
                })
            });
            const data = await response.json();
            if (data.join_url) {
                registrantJoinLinks.push({
                email,
                joinUrl: data.join_url,
                });
            } else {
                console.error("Failed to add registrant:", email, data);
            }
        });
        await Promise.all(registrantsPromises);
        res['registrants'] = registrantJoinLinks;
    } else {
        console.log("Free Zoom account detected, skipping registrant addition.");
        // Skip step but just add the join URL for all invitees
        invitees.forEach((invitee) => {
            res['registrants'].push({
                email: invitee.email,
                joinUrl: meeting.join_url,
            });
        });
    }
    return res;

}

export const checkZoomMeetingTimeConflict = async (
    proposedStartTime: string, proposedEndTime: string, selectedDate: string,timezone: string) => {
    const fromDate = combineDateAndTime(selectedDate, proposedStartTime);
    const toDate = combineDateAndTime(selectedDate, proposedEndTime);
    const IANATimezone = convertTimeZoneToIANA(timezone);
    const accessToken = await fetchZoomAccessToken();
    const response = await fetch(`https://api.zoom.us/v2/users/me/meetings?type=scheduled&from=${fromDate.slice(0, 10)}&to=${toDate.slice(0, 10)}&timezone=${IANATimezone}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    const meetings = data.meetings;
    console.log("Existing meetings fetched for conflict check:", meetings);
    // Check for conflicts
    for (const meeting of meetings) {
        const meetingStart = new Date(meeting.start_time);
        const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);
        const proposedStart = new Date(fromDate);
        const proposedEnd = new Date(toDate);
        if (
            (proposedStart >= meetingStart && proposedStart < meetingEnd) ||
            (proposedEnd > meetingStart && proposedEnd <= meetingEnd) ||
            (proposedStart <= meetingStart && proposedEnd >= meetingEnd)
        ) {
            console.log("Conflict found with meeting:", meeting);
            return meeting.topic || "Unnamed Meeting";
        }
    }
    return null; // No conflict found
}

export const isFreeAccount = async () => {
    const accessToken = await fetchZoomAccessToken();
    if (!accessToken) {
        return false
    }
    const response = await fetch("https://api.zoom.us/v2/users/me", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    return data.type === 1;
}


export const deleteZoomMeeting = async (meetingId: string, sendUpdates:boolean = false) => {
    const accessToken = await fetchZoomAccessToken();
    if (!accessToken) {
        return false;
    }
    console.log("SYED-DEBUG: Deleting Zoom meeting with ID:", meetingId);
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}?schedule_for_reminder=${sendUpdates}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log("Zoom meeting deletion response status:", response);
    return response.status === 204;
}
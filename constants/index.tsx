import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from "@expo/vector-icons/Entypo";
import { ReactNode } from "react";

const placeholder = "https://placehold.co/600x400/png"
const companyLogo = "https://placehold.co/40x40/png"
export const images = {
    placeholder,
    companyLogo
}

export enum UserDocumentType {
    RESUME = 'RESUME',
    TRANSCRIPT = 'TRANSCRIPT',
    RECOMMENDATION = 'RECOMMENDATION',
    COVER_LETTER = 'COVER_LETTER',
    CERTIFICATE = 'CERTIFICATE'
}

export const profileLinkInfo : {label: string, icon: ReactNode, href: string}[] = [
    {'label': 'Edit Profile', 'icon': <AntDesign name="user" size={28} color="black"/>, 'href': '/profile/editProfile'},
    {'label': 'Job Applied To', 'icon': <AntDesign name="filetext1" size={28} color="black"/>, 'href': '/profile/appliedJobs'},
    {'label': 'Favorite Jobs', 'icon': <AntDesign name="staro" size={28} color="black"/>, 'href': '/profile/favoriteJobs'},
    {'label': 'Manage Documents', 'icon': <Entypo name="documents" size={28} color="black"/>, 'href': '/profile/manageDocs'},
    {'label': 'Upcoming Interviews', 'icon': <AntDesign name="calendar" size={28} color="black"/>, 'href': '/profile/upcomingInterviews'},
    {'label': 'Account Settings', 'icon': <AntDesign name="setting" size={28} color="black"/>, 'href': '/profile/accountSettings'},
    {'label': 'Logout', 'icon': <AntDesign name="logout" size={28} color="red"/>, 'href': '/(auth)/sign-in'}
]
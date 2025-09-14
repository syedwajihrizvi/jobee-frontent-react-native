import resumeImage from "@/assets/images/sampleResume.jpg";
import { Feather } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";

import { ReactNode } from "react";

const placeholder = "https://placehold.co/600x400/png"
const companyLogo = "https://placehold.co/40x40/png"
export const images = {
    placeholder,
    companyLogo,
    resumeImage
}

export enum UserDocumentType {
    RESUME = 'RESUME',
    TRANSCRIPT = 'TRANSCRIPT',
    RECOMMENDATION = 'RECOMMENDATION',
    COVER_LETTER = 'COVER_LETTER',
    CERTIFICATE = 'CERTIFICATE'
}

export const profileLinkInfo : {label: string, icon: ReactNode, href: string}[] = [
    {'label': 'Edit Profile', 'icon': <Feather name="user" size={28} color="black"/>, 'href': '/profile/editProfile'},
    {'label': 'Job Applied To', 'icon': <Feather name="file" size={28} color="black"/>, 'href': '/profile/appliedJobs'},
    {'label': 'Favorite Jobs', 'icon': <Feather name="star" size={28} color="black"/>, 'href': '/profile/favoriteJobs'},
    {'label': 'Manage Documents', 'icon': <Entypo name="documents" size={28} color="black"/>, 'href': '/profile/manageDocs'}
]
import resumeImage from "@/assets/images/sampleResume.jpg";
import popSound from "@/assets/sounds/pop.mp3";
import { Feather } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";

import { ReactNode } from "react";

const placeholder = "https://placehold.co/600x400/png";
const companyLogo = "https://placehold.co/40x40/png";
export const images = {
  placeholder,
  companyLogo,
  resumeImage,
};

export const sounds = {
  popSound,
};

export enum UserDocumentType {
  RESUME = "RESUME",
  TRANSCRIPT = "TRANSCRIPT",
  RECOMMENDATION = "RECOMMENDATION",
  COVER_LETTER = "COVER_LETTER",
  CERTIFICATE = "CERTIFICATE",
}

export const profileLinkInfo: {
  label: string;
  icon: ReactNode;
  href: string;
}[] = [
  {
    label: "Edit Profile",
    icon: <Feather name="user" size={28} color="black" />,
    href: "/profile/editProfile",
  },
  {
    label: "Job Applied To",
    icon: <Feather name="briefcase" size={28} color="black" />,
    href: "/profile/appliedJobs",
  },
  {
    label: "Favorite Jobs",
    icon: <Feather name="star" size={28} color="black" />,
    href: "/profile/favoriteJobs",
  },
  {
    label: "Manage Documents",
    icon: <Entypo name="documents" size={28} color="black" />,
    href: "/profile/manageDocs",
  },
];

export const employmentTypes = [
  { label: "Full-Time", value: "FULL_TIME" },
  { label: "Part-Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Internship", value: "INTERN" },
  { label: "Freelance", value: "FREELANCE" },
];

export const experienceLevels = [
  { label: "0-2", value: "0-2" },
  { label: "3-5", value: "3-5" },
  { label: "6-8", value: "6-8" },
  { label: "9+", value: "9+" },
];

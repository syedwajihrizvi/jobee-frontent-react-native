import resumeImage from "@/assets/images/sampleResume.jpg";
import beepSound from "@/assets/sounds/beep.mp3";
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
  beepSound,
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
  subtitle?: string;
  href: string;
}[] = [
  {
    label: "Edit Profile",
    subtitle: "Update your personal information, experience, and more.",
    icon: <Feather name="user" size={20} color="black" />,
    href: "/profile/editProfile",
  },
  {
    label: "Job Applied To",
    subtitle: "View the jobs you have applied to.",
    icon: <Feather name="briefcase" size={20} color="black" />,
    href: "/profile/appliedJobs",
  },
  {
    label: "Favorite Jobs",
    subtitle: "View and manage your favorite job listings.",
    icon: <Feather name="star" size={20} color="black" />,
    href: "/profile/favoriteJobs",
  },
  {
    label: "Manage Documents",
    subtitle: "Upload and manage your resumes, cover letters, and other documents.",
    icon: <Entypo name="documents" size={20} color="black" />,
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

export const workArrangements = [
  { label: "On-Site", value: "ON_SITE" },
  { label: "Remote", value: "REMOTE" },
  { label: "Hybrid", value: "HYBRID" },
];

export const experienceLevels = [
  { label: "0-2", value: "0-2" },
  { label: "3-5", value: "3-5" },
  { label: "6-8", value: "6-8" },
  { label: "9+", value: "9+" },
];

export const interviewPrepChecklist = [
  "Go over your strengths and why you are a great fit for this role.",
  "Analyze your weaknesses and how you can improve on them.",
  "Find resources and online tools to help you prepare for the interview.",
  "Try sample questions and practice your answers.",
];

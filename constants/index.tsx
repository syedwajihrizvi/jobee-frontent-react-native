import resumeImage from "@/assets/images/sampleResume.jpg";
import beepSound from "@/assets/sounds/beep.mp3";
import popSound from "@/assets/sounds/pop.mp3";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
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

export const userProfileLinks: {
  label: string;
  icon: ReactNode;
  subtitle?: string;
  href: string;
}[] = [
  {
    label: "Edit Profile",
    subtitle: "Update your personal information, experience, and more.",
    icon: <Feather name="user" size={20} color="black" />,
    href: "/userProfile/editProfile",
  },
  {
    label: "Job Applied To",
    subtitle: "View the jobs you have applied to.",
    icon: <Feather name="briefcase" size={20} color="black" />,
    href: "/userProfile/appliedJobs",
  },
  {
    label: "Favorite Jobs",
    subtitle: "View and manage your favorite job listings.",
    icon: <Feather name="star" size={20} color="black" />,
    href: "/userProfile/favoriteJobs",
  },
  {
    label: "Favorite Companies",
    subtitle: "View and manage your favorite companies.",
    icon: <FontAwesome5 name="building" size={20} color="black" />,
    href: "/userProfile/favoriteCompanies",
  },
  {
    label: "Manage Documents",
    subtitle: "Upload and manage your resumes, cover letters, and other documents.",
    icon: <Entypo name="documents" size={20} color="black" />,
    href: "/userProfile/manageDocs",
  },
];

export const businessProfileLinks: {
  label: string;
  icon: ReactNode;
  subtitle?: string;
  href: string;
}[] = [
  {
    label: "Edit Profile",
    subtitle: "Update your personal information, social media links, and more.",
    icon: <Feather name="user" size={20} color="black" />,
    href: "/businessProfile/editProfile",
  },
  {
    label: "Active Job Postings",
    subtitle: "View the jobs you have posted.",
    icon: <Feather name="briefcase" size={20} color="black" />,
    href: "/businessProfile/myJobPostings",
  },
  {
    label: "Edit Company Profile",
    subtitle: "View and manage your company details, size, location, media, and more.",
    icon: <FontAwesome5 name="building" size={20} color="black" />,
    href: "/businessProfile/companyProfile",
  },
  {
    label: "Upcoming Interviews",
    subtitle: "View and manage your upcoming interviews with candidates.",
    icon: <Feather name="calendar" size={20} color="black" />,
    href: "/businessProfile/interviews",
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
  { label: "Any", value: "ANY" },
  { label: "Intern", value: "INTERN" },
  { label: "Entry", value: "ENTRY" },
  { label: "Junior", value: "JUNIOR_LEVEL" },
  { label: "Mid-Level", value: "MID_LEVEL" },
  { label: "Senior", value: "SENIOR_LEVEL" },
  { label: "Lead", value: "LEAD" },
];

export const interviewPrepChecklist = [
  "Go over your strengths and why you are a great fit for this role.",
  "Analyze your weaknesses and how you can improve on them.",
  "Find resources and online tools to help you prepare for the interview.",
  "Try sample questions and practice your answers.",
];

import coderpad from "@/assets/images/coderpad.png";
import codesignal from "@/assets/images/codesignal.png";
import companyLogo from "@/assets/images/companyLogo.png";
import googleMeet from "@/assets/images/googlemeet.webp";
import resumeImage from "@/assets/images/sampleResume.jpg";
import webex from "@/assets/images/webex.png";
import zoom from "@/assets/images/zoom.png";
import beepSound from "@/assets/sounds/beep.mp3";
import newMessageSound from "@/assets/sounds/newMessage.mp3";
import newNotification from "@/assets/sounds/newNotification.mp3";
import popSound from "@/assets/sounds/pop.mp3";
import successSound from "@/assets/sounds/success.mp3";

import { Feather, FontAwesome5 } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";

import { ReactNode } from "react";

const placeholder = "https://placehold.co/600x400/png";

export const platformLogos = {
  WEBEX: webex,
  GOOGLE_MEET: googleMeet,
  ZOOM: zoom,
  CODERPAD: coderpad,
  CODESIGNAL: codesignal,
};

export const images = {
  placeholder,
  companyLogo,
  resumeImage,
};

export const sounds = {
  popSound,
  beepSound,
  newMessageSound,
  newNotification,
  successSound,
};

export const meetingPlatforms = [
  {
    label: "Zoom",
    value: "ZOOM",
    bgColor: "#E3F2FD", // Light blue
    textColor: "#0B5CFF", // Zoom blue
  },
  {
    label: "Google Meet",
    value: "GOOGLE_MEET",
    bgColor: "#E8F5E9", // Light green
    textColor: "#188038", // Google green
  },
  {
    label: "Microsoft Teams",
    value: "MICROSOFT_TEAMS",
    bgColor: "#F3E5F5", // Light purple
    textColor: "#5A2D91", // Teams purple
  },
  {
    label: "Webex",
    value: "WEBEX",
    bgColor: "#E0F2F1", // Light teal
    textColor: "#00897B", // Webex teal
  },
  {
    label: "Other",
    value: "OTHER",
    bgColor: "#F5F5F5", // Light gray
    textColor: "#616161", // Dark gray
  },
];

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
    icon: <Feather name="user" size={20} color="#10b981" />,
    href: "/userProfile/editProfile",
  },
  {
    label: "Job Applied To",
    subtitle: "View the jobs you have applied to.",
    icon: <Feather name="briefcase" size={20} color="#10b981" />,
    href: "/userProfile/appliedJobs",
  },
  {
    label: "Favorite Jobs",
    subtitle: "View and manage your favorite job listings.",
    icon: <Feather name="star" size={20} color="#10b981" />,
    href: "/userProfile/favoriteJobs",
  },
  {
    label: "Favorite Companies",
    subtitle: "View and manage your favorite companies.",
    icon: <FontAwesome5 name="building" size={20} color="#10b981" />,
    href: "/userProfile/favoriteCompanies",
  },
  {
    label: "Manage Documents",
    subtitle: "Upload and manage your resumes, cover letters, and other documents.",
    icon: <Entypo name="documents" size={20} color="#10b981" />,
    href: "/userProfile/manageDocs",
  },
];

export const adminOnlyProfileLinks: {
  label: string;
  icon: ReactNode;
  subtitle?: string;
  href: string;
}[] = [
  {
    label: "Edit Company Profile",
    subtitle: "View and manage your company details, size, location, media, and more.",
    icon: <FontAwesome5 name="building" size={20} color="#10b981" />,
    href: "/businessProfile/companyProfile",
  },
];

export const recruiterOnlyProfileLinks: {
  label: string;
  icon: ReactNode;
  subtitle?: string;
  href: string;
}[] = [
  {
    label: "Invite or Remove Users",
    subtitle: "Manage users associated with your company.",
    icon: <Feather name="users" size={20} color="#10b981" />,
    href: "/businessProfile/manageUsers",
  },
  {
    label: "Active Job Postings",
    subtitle: "View the jobs you have posted.",
    icon: <Feather name="briefcase" size={20} color="#10b981" />,
    href: "/businessProfile/myJobPostings",
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
    icon: <Feather name="user" size={20} color="#10b981" />,
    href: "/businessProfile/editProfile",
  },
  {
    label: "Upcoming Interviews",
    subtitle: "View upcoming interviews with candidates.",
    icon: <Feather name="calendar" size={20} color="#10b981" />,
    href: "/businessProfile/interviews?status=SCHEDULED",
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

export const appliedWithinOptions = [
  { label: "Any", value: undefined },
  { label: "24 hours", value: 1 },
  { label: "3 days", value: 3 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

export const applicationStatusOptions = [
  {
    label: "Shortlisted",
    value: "SHORTLISTED",
    textColor: "#10b981", // Emerald 500
    bgColor: "#ecfdf5", // Emerald 50
    activeBgColor: "#10b981", // Emerald 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Pending",
    value: "PENDING",
    textColor: "#3b82f6", // Blue 500
    bgColor: "#eff6ff", // Blue 50
    activeBgColor: "#3b82f6", // Blue 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Interview Scheduled",
    value: "INTERVIEW_SCHEDULED",
    textColor: "#f59e0b", // Amber 500
    bgColor: "#fffbeb", // Amber 50
    activeBgColor: "#f59e0b", // Amber 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Interview Completed",
    value: "INTERVIEW_COMPLETED",
    textColor: "#8b5cf6", // Purple 500
    bgColor: "#faf5ff", // Purple 50
    activeBgColor: "#8b5cf6", // Purple 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Offered",
    value: "OFFER_MADE",
    textColor: "#10b981", // Emerald 500
    bgColor: "#ecfdf5", // Emerald 50
    activeBgColor: "#10b981", // Emerald 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Rejected",
    value: "REJECTED",
    textColor: "#ef4444", // Red 500
    bgColor: "#fef2f2", // Red 50
    activeBgColor: "#ef4444", // Red 500
    activeTextColor: "#ffffff", // White
  },
];

export const getInterviewEmptyContent = (status: string | undefined) => {
  switch (status) {
    case "PENDING":
      return {
        title: "No Pending Interviews",
        message: "You do not have any pending interviews at the moment.",
        textColor: "#10b981", // emerld-500
        bgColor: "#ecfdf5", // emerald-100
      };
    case "SCHEDULED":
      return {
        title: "No Scheduled Interviews",
        message: "You do not have any upcoming interviews scheduled.",
        textColor: "#f59e0b", // blue-500
        bgColor: "#fffbeb", // blue-100
      };
    case "COMPLETED":
      return {
        title: "No Completed Interviews",
        message: "You have not completed any interviews yet.",
        textColor: "#8b5cf6", // purple-500
        bgColor: "#faf5ff", // purple-100
      };
    case "REJECTED":
      return {
        title: "No Rejected Interviews",
        message: "You have not had any interviews that were rejected.",
        textColor: "#ef4444", // red-500
        bgColor: "#fef2f2", // red-100
      };
    case "CANCELLED":
      return {
        title: "No Cancelled Interviews",
        message: "You have not had any interviews that were cancelled.",
        textColor: "#f97316", // orange-500
        bgColor: "#fff7ed", // orange-100
      };
    default:
      return {
        title: "No Interviews Yet",
        message: "When you schedule interviews, they will appear here.",
        textColor: "#3b82f6", // blue-500
        bgColor: "#eff6ff", // blue-100
      };
  }
};

export const interviewFilterOptions = [
  {
    label: "Upcoming",
    value: "SCHEDULED",
    textColor: "#f59e0b", // Amber 500
    bgColor: "#fffbeb", // Amber 50
    activeBgColor: "#f59e0b", // Amber 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Completed",
    value: "COMPLETED",
    textColor: "#8b5cf6", // Purple 500
    bgColor: "#faf5ff", // Purple 50
    activeBgColor: "#8b5cf6", // Purple 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Pending Decision",
    value: "PENDING",
    textColor: "#10b981", // Emerald 500
    bgColor: "#ecfdf5", // Emerald 50
    activeBgColor: "#10b981", // Emerald 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Rejected",
    value: "REJECTED",
    textColor: "#ef4444", // Red 500
    bgColor: "#fef2f2", // Red 50
    activeBgColor: "#ef4444", // Red 500
    activeTextColor: "#ffffff", // White
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
    textColor: "#f97316", // Orange 500
    bgColor: "#fff7ed", // Orange 50
    activeBgColor: "#f97316", // Orange 500
    activeTextColor: "#ffffff", // White
  },
];

export const getAPIUrl = (path: string) => {
  const baseUrl = "http://192.168.2.29:8080/api/";
  return `${baseUrl}${path}`;
};

export const COMMON_TIMEZONES = [
  { label: "UTC", value: "UTC" },
  // North America
  { label: "Eastern Time (ET)", value: "ET" },
  { label: "Central Time (CT)", value: "CT" },
  { label: "Mountain Time (MT)", value: "MT" },
  { label: "Pacific Time (PT)", value: "PT" },

  // Europe
  { label: "London (UK)", value: "UK" },
  { label: "Central Europe (CET)", value: "CET" },

  // Middle East / Asia
  { label: "Dubai (UAE)", value: "UAE" },
  { label: "India (IST)", value: "IST" },
  { label: "Singapore", value: "SINGAPORE" },
  { label: "China (Beijing)", value: "CHINA" },
  { label: "Japan (Tokyo)", value: "TOKYO" },

  // Australia
  { label: "Sydney (Australia)", value: "AUSTRALIA" },
];

export const mapTimezoneValueToLabel = (value: string) => {
  const timezone = COMMON_TIMEZONES.find((tz) => tz.value === value);
  return timezone ? timezone.label : value;
};

import { User, UserDocument } from "@/type";

  export const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
    return formatter.format(parsedDate)
  }

export const isApplied = (user: User, jobId: string) =>user?.applications.find(app => app.jobId === Number(jobId))

export const getUserDocumentById = (id: number, user: User): UserDocument | undefined => {
    return user?.documents.find(doc => doc.id === id);
}

export const getEducationLevel = (level: string) => {
  switch(level) {
    case 'High School':
      return 'HIGH_SCHOOL';
    case 'Diploma':
      return "DIPLOMA";
    case 'Associates':
      return "ASSOCIATES";
    case 'Undergraduate':
      return "UNDERGRADUATE";
    case 'Postgraduate':
      return "POSTGRADUATE";
    case 'PHD':
      return "PHD";
    case 'Post Docotorate':
      return "POST_DOCTORATE";
  };
}
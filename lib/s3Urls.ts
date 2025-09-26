const bucketName = 'jobee-backend'; // Replace with your S3 bucket name
const region = 'us-west-2'; // Replace with your S3 bucket region

export const getS3ProfileImage = (key: string) => {
    return `https://${bucketName}.s3.${region}.amazonaws.com/user-profile-images/${key}`;
};

export const getS3DocumentUrl = (key: string) => {
    return `https://${bucketName}.s3.${region}.amazonaws.com/user-documents/${key}`;
};

export const getS3VideoIntroUrl = (key: string) => {
    return `https://${bucketName}.s3.${region}.amazonaws.com/user-video-intros/${key}`;
}

export const getS3InterviewQuestionAudioUrl = (interviewId: number, prepQuestion: number) => {
    const res = `https://${bucketName}.s3.${region}.amazonaws.com/interview-prep/${interviewId}/${prepQuestion}.mp3`;
    console.log("Generated S3 URL: ", res);
    return res;
}
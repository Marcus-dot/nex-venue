export type User = {
  uid: string;
  phoneNumber: string | null;
};

export type UserProfile = {
    uid: string | undefined;
    phoneNumber: string;
    fullName?: string;
    email?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    createdAt: number;
    profileComplete?: boolean;
    avatar: string | null;
}
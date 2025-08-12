import { signOut, getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';

export const sendVerificationCode = async (phoneNumber: string) => {
  try {
    const confirmation = await signInWithPhoneNumber(getAuth(), phoneNumber);
    return confirmation;
  } catch (error) {
    console.error("failed", error)
    throw error;
  }
};

export const confirmVerificationCode = async (confirmation: any, code: string) => {
  try {
    const result = await confirmation.confirm(code);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(getAuth());
  } catch (error) {
    throw error;
  }
};
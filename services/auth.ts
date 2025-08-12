import auth from '@react-native-firebase/auth';

export const sendVerificationCode = async (phoneNumber: string) => {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
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
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};
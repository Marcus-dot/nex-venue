// services/auth.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const sendVerificationCode = async (phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> => {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation;
  } catch (error) {
    console.error("Failed to send verification code:", error);
    throw error;
  }
};

export const confirmVerificationCode = async (
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  code: string
): Promise<FirebaseAuthTypes.User> => {
  try {
    const result = await confirmation.confirm(code);
    if (!result) {
      throw new Error("Confirmation result is null.");
    }
    return result.user;
  } catch (error) {
    console.error("Failed to confirm verification code:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error("Failed to logout user:", error);
    throw error;
  }
};
export const formatPhoneNumber = (phoneNumber: any) => {
  
    phoneNumber = phoneNumber.replace(/[\s()-]/g, '').trim();
  
    if (phoneNumber.startsWith('0')) {
      return '+260' + phoneNumber.slice(1);
    }
  
    if (phoneNumber.startsWith('260') && !phoneNumber.startsWith('+260')) {
      return '+260' + phoneNumber.slice(3);
    }
  
    if (phoneNumber.startsWith('+260')) {
      return phoneNumber;
    }
  
}

export const formatCountdownTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
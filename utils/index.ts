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
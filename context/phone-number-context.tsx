import React, { createContext, useContext, useState } from 'react';

type PhoneNumberContextType = {
    phoneNumber: string;
    setPhoneNumber: (number: string) => void;
}

const PhoneNumberContext = createContext<PhoneNumberContextType>({
    phoneNumber: "",
    setPhoneNumber: () => {}
});

export const PhoneNumberProvider : React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const value = {
        phoneNumber,
        setPhoneNumber
    }

    return (
        <PhoneNumberContext.Provider value={value}>
            {children}
        </PhoneNumberContext.Provider>
    )
}

export const usePhoneNumber = () => {
    const context = useContext(PhoneNumberContext);
    if(!context) {
        throw new Error('usePhoneNumber must be used within a PhoneNumberProvider');
    }
    return context;
}
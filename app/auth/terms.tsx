import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionButton from '@/components/action-button';
import BackNav from '@/components/back-nav';
import { TEXT_SIZE } from '@/constants';
import { useTheme } from '@/context/theme-context';

const Terms = () => {
  const { toggle } = useLocalSearchParams();
  const initialToggle = Array.isArray(toggle) ? toggle[0] : toggle;
  const { activeTheme } = useTheme();

  const [toggleView, setToggleView] = useState<'tncs' | 'pps'>(
    initialToggle === 'pps' ? 'pps' : 'tncs'
  );

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#222551',
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
    accent: '#e85c29',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    toggleBackground: activeTheme === 'light' ? '#ffffff' : '#374151',
    toggleBorder: activeTheme === 'light' ? '#e5e7eb' : '#4b5563',
    toggleShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
    contentBackground: activeTheme === 'light' ? '#ffffff' : '#1f2937',
    contentText: activeTheme === 'light' ? '#374151' : '#e5e7eb',
    sectionBackground: activeTheme === 'light' ? '#f8fafc' : '#111827',
    sectionBorder: activeTheme === 'light' ? '#e2e8f0' : '#374151'
  };

  // Sample content for demonstration
  const termsContent = `
**TERMS AND CONDITIONS OF USE**

**Last Updated: January 2025**

**1. ACCEPTANCE OF TERMS**
By accessing and using NexVenue ("the App"), you accept and agree to be bound by the terms and provision of this agreement.

**2. DESCRIPTION OF SERVICE**
NexVenue is a mobile application that allows users to discover, create, and manage events. The service includes event discovery, agenda management, real-time updates, and communication features.

**3. USER ACCOUNTS**
- You must provide accurate and complete registration information
- You are responsible for maintaining the confidentiality of your account
- You agree to accept responsibility for all activities under your account

**4. USER CONDUCT**
You agree not to:
- Use the service for any unlawful purpose
- Post inappropriate, offensive, or harmful content
- Attempt to gain unauthorized access to our systems
- Interfere with other users' enjoyment of the service

**5. EVENT CREATION AND MANAGEMENT**
- Event creators are responsible for accurate event information
- NexVenue reserves the right to remove inappropriate events
- Users attend events at their own risk

**6. INTELLECTUAL PROPERTY**
All content and materials available through NexVenue are protected by intellectual property rights.

**7. PRIVACY**
Your privacy is important to us. Please review our Privacy Policy to understand our practices.

**8. LIMITATION OF LIABILITY**
NexVenue shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

**9. MODIFICATIONS**
We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.

**10. TERMINATION**
We may terminate or suspend your account at any time for violations of these terms.

**11. GOVERNING LAW**
These terms are governed by the laws of the Republic of Zambia.

**12. CONTACT INFORMATION**
For questions about these terms, contact us at:
Email: legal@nexvenue.com
Phone: +260 123 456 789
`;

  const privacyContent = `
**PRIVACY POLICY**

**Last Updated: January 2025**

**1. INFORMATION WE COLLECT**

**Personal Information:**
- Phone number (for account verification)
- Name and profile information
- Event attendance and creation history

**Usage Information:**
- App usage patterns and preferences
- Device information and analytics
- Location data (with permission)

**2. HOW WE USE YOUR INFORMATION**
- To provide and improve our services
- To send you relevant event notifications
- To ensure security and prevent fraud
- To analyze usage patterns and enhance user experience

**3. INFORMATION SHARING**
We do not sell your personal information. We may share data:
- With event organizers (attendance information)
- With service providers who assist our operations
- When required by law or to protect rights

**4. DATA SECURITY**
We implement appropriate security measures to protect your information:
- Encryption of sensitive data
- Secure data transmission
- Regular security audits
- Limited access controls

**5. YOUR RIGHTS**
You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Control notification preferences

**6. DATA RETENTION**
We retain your information for as long as your account is active or as needed to provide services.

**7. CHILDREN'S PRIVACY**
NexVenue is not intended for users under 13 years of age.

**8. INTERNATIONAL TRANSFERS**
Your information may be transferred to and processed in countries other than Zambia.

**9. COOKIES AND TRACKING**
We use cookies and similar technologies to enhance your experience and analyze usage.

**10. CHANGES TO PRIVACY POLICY**
We will notify you of any material changes to this privacy policy.

**11. THIRD-PARTY SERVICES**
This policy does not apply to third-party services linked from our app.

**12. CONTACT US**
For privacy-related questions:
Email: privacy@nexvenue.com
Phone: +260 123 456 789
Address: Lusaka, Zambia

**Data Protection Officer:**
Email: dpo@nexvenue.com
`;

  const renderContent = (content: string) => {
    const sections = content.split('\n\n').filter(section => section.trim());

    return sections.map((section, index) => {
      const trimmedSection = section.trim();

      // Check if it's a header (starts with **)
      if (trimmedSection.startsWith('**') && trimmedSection.endsWith('**')) {
        const headerText = trimmedSection.replace(/\*\*/g, '');
        return (
          <View
            key={index}
            className="mb-4 p-3 rounded-lg border"
            style={{
              backgroundColor: themeColors.sectionBackground,
              borderColor: themeColors.sectionBorder
            }}
          >
            <Text
              className="font-rubik-bold text-lg"
              style={{
                fontSize: TEXT_SIZE * 0.9,
                color: themeColors.text
              }}
            >
              {headerText}
            </Text>
          </View>
        );
      }

      // Regular content
      return (
        <View key={index} className="mb-4">
          <Text
            className="font-rubik leading-6"
            style={{
              fontSize: TEXT_SIZE * 0.8,
              color: themeColors.contentText,
              lineHeight: TEXT_SIZE * 1.2
            }}
          >
            {trimmedSection}
          </Text>
        </View>
      );
    });
  };

  return (
    <SafeAreaView
      className='flex-1'
      style={{ backgroundColor: themeColors.background }}
    >
      <BackNav
        title='Terms & Conditions'
        handlePress={() => router.back()}
        backgroundColor={themeColors.background}
        textColor={themeColors.text}
        iconColor={themeColors.text}
      />

      <View className='w-full h-[92%] flex'>
        {/* Toggle Selector */}
        <View className={`w-full h-[10%] flex flex-row items-center justify-center`}>
          <View
            className={`w-[80%] h-[60%] rounded-[25px] flex flex-row overflow-hidden border`}
            style={{
              backgroundColor: themeColors.toggleBackground,
              borderColor: themeColors.toggleBorder,
              shadowColor: themeColors.toggleShadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <TouchableOpacity
              onPress={() => { setToggleView("tncs") }}
              className={`w-1/2 h-full flex items-center justify-center rounded-[25px]`}
              style={{
                backgroundColor: toggleView === "tncs"
                  ? themeColors.accent
                  : 'transparent'
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: TEXT_SIZE * 0.7,
                  color: toggleView === "tncs"
                    ? "white"
                    : themeColors.text
                }}
                className="font-rubik-medium"
              >
                Terms & Conditions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setToggleView("pps")}
              className={`w-1/2 h-full flex items-center justify-center rounded-[25px]`}
              style={{
                backgroundColor: toggleView === "pps"
                  ? themeColors.accent
                  : 'transparent'
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: TEXT_SIZE * 0.7,
                  color: toggleView === "pps"
                    ? "white"
                    : themeColors.text
                }}
                className="font-rubik-medium"
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View className='w-full h-[75%] px-5'>
          <ScrollView
            className={`w-full rounded-xl p-4 border`}
            style={{
              backgroundColor: themeColors.contentBackground,
              borderColor: themeColors.border
            }}
            showsVerticalScrollIndicator={false}
          >
            {renderContent(toggleView === "tncs" ? termsContent : privacyContent)}

            {/* Footer */}
            <View
              className="mt-8 pt-4 border-t"
              style={{ borderTopColor: themeColors.border }}
            >
              <Text
                className="font-rubik text-center"
                style={{
                  fontSize: TEXT_SIZE * 0.7,
                  color: themeColors.textTertiary
                }}
              >
                © {new Date().getFullYear()} NexVenue - Powered by Gralix
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Action Button */}
        <View className='w-full h-[15%] flex items-center justify-center px-5'>
          <ActionButton
            showArrow={false}
            handlePress={() => router.back()}
            buttonText={`I understand the ${toggleView === "tncs" ? "Terms & Conditions" : "Privacy Policy"}`}
            width="100%"
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Terms;
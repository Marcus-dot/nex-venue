import firestore from '@react-native-firebase/firestore';
import { AgendaItem } from '../types/agenda';

// Your exact IDs from Firebase
const EVENT_ID = 'moz2ZHt9bgPewyg7xuQM';
const ADMIN_USER_ID = 'ootFc5IZFbP9FFN2ao3Ri9urqgq2';

const gicAgendaData: Omit<AgendaItem, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>[] = [
    // Day 1: Thursday 2nd October 2025
    {
        title: "Registration",
        startTime: "08:30",
        endTime: "09:00",
        date: "2025-10-02",
        location: "Intercontinental Hotel, Lusaka",
        category: "other",
        isBreak: false,
        order: 1,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Opening Remarks and Welcome Guests",
        startTime: "09:00",
        endTime: "09:10",
        date: "2025-10-02",
        speaker: "Amina Kaunda and Honey (MCs)",
        location: "Intercontinental Hotel, Lusaka",
        category: "other",
        order: 2,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Official Welcome from Gralix Group CEO",
        startTime: "09:10",
        endTime: "09:20",
        date: "2025-10-02",
        speaker: "Mulenga Mutati - Gralix Group CEO",
        location: "Intercontinental Hotel, Lusaka",
        category: "keynote",
        order: 3,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Remarks from IAZ",
        startTime: "09:20",
        endTime: "09:30",
        date: "2025-10-02",
        speaker: "Dr Nkaka Mwashika - Executive Director, Insurers Association of Zambia (IAZ)",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 4,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Remarks from FSD Africa",
        startTime: "09:30",
        endTime: "09:40",
        date: "2025-10-02",
        speaker: "Juliet Munro - Director, Early-Stage Finance, FSD Africa",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 5,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Remarks from PIA",
        startTime: "09:40",
        endTime: "09:50",
        date: "2025-10-02",
        speaker: "Mrs Namakau Ntini - Registrar, Pensions and Insurance Authority",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 6,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Official Opening by Guest of Honour",
        startTime: "09:50",
        endTime: "10:10",
        date: "2025-10-02",
        speaker: "Hon. Situmbeko Musokotwane - Minister of Finance and National Planning, Republic of Zambia",
        location: "Intercontinental Hotel, Lusaka",
        category: "keynote",
        order: 7,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Gralix Group Marketing Slot",
        startTime: "10:10",
        endTime: "10:35",
        date: "2025-10-02",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 8,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "The Future of Insurance in Africa -- 3A to 3D through BimaLab",
        startTime: "10:35",
        endTime: "11:00",
        date: "2025-10-02",
        speaker: "Elias Omondi - Principal, Innovation for Resilience, FSD Africa",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 9,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Tea Break / Media Engagement / Q & A",
        startTime: "11:00",
        endTime: "11:30",
        date: "2025-10-02",
        location: "Intercontinental Hotel, Lusaka",
        category: "break",
        isBreak: true,
        order: 10,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Case Study: Code by Code vs Brick by Brick - The Story of Pineapple Insurance",
        startTime: "11:30",
        endTime: "12:00",
        date: "2025-10-02",
        speaker: "Ndabenhle Junior Ngulube - Co-Founder, Pineapple Insurance",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 11,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Insurtech Showcase Segment",
        description: "Top 3 BimaLab Africa 2025 Insurtechs showcase",
        startTime: "12:00",
        endTime: "12:30",
        date: "2025-10-02",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 12,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Agrails Demo",
        startTime: "12:30",
        endTime: "12:45",
        date: "2025-10-02",
        speaker: "Mathews Saunders",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 13,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Labelfuse Demo",
        startTime: "12:45",
        endTime: "13:00",
        date: "2025-10-02",
        speaker: "Kelvin Aaongola",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 14,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Lunch",
        startTime: "13:00",
        endTime: "14:00",
        date: "2025-10-02",
        location: "Intercontinental Hotel, Lusaka",
        category: "break",
        isBreak: true,
        order: 15,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "PICZ Marketing Slot",
        startTime: "14:00",
        endTime: "14:20",
        date: "2025-10-02",
        speaker: "Mambwe Kachasa - Head of Business Development, PICZ",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 16,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Panel Discussion: An Insurance COO's Worst Nightmare",
        description: "Insight into the Operational and Technological Challenges that the Industry Grapples with",
        startTime: "14:20",
        endTime: "15:00",
        date: "2025-10-02",
        speaker: "Moderator: Martin Chiware / Chipo Sichizya | Panelists: Yvonne Majata (COO, PICZ), Saulose (COO, Klapton Reinsurance), Mphatso Tembo (COO, Sanlam), Thelma Siame (Group COO, Madison Group)",
        location: "Intercontinental Hotel, Lusaka",
        category: "panel",
        order: 17,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Klapton Re Marketing Slot",
        startTime: "15:00",
        endTime: "15:05",
        date: "2025-10-02",
        speaker: "Lynn Harold - Deputy CEO and Head of Marketing, Klapton Reinsurance",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 18,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Panel Discussion: Banking and Investment Companies' Strategies to Support Insurtech",
        description: "Banking and Investment Companies' Strategies to Support Insurtech and Insurer's Digital Transformation Journey",
        startTime: "15:05",
        endTime: "15:45",
        date: "2025-10-02",
        speaker: "Moderator: Mulumba Lwatula (Head of Investments, IDC) | Panelists: FSD Africa Investments, Sonny Zulu (CEO, Standard Chartered), Mizinga Melu (CEO, ABSA), First Circle Capital, Musonda Chipalo (CEO, GIPZ)",
        location: "Intercontinental Hotel, Lusaka",
        category: "panel",
        order: 19,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Tea Break",
        startTime: "15:45",
        endTime: "16:10",
        date: "2025-10-02",
        location: "Intercontinental Hotel, Lusaka",
        category: "break",
        isBreak: true,
        order: 20,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Welcome Dinner",
        startTime: "18:00",
        endTime: "20:00",
        date: "2025-10-02",
        location: "Intercontinental Hotel, Lusaka",
        category: "networking",
        order: 21,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },

    // Day 2: Friday 3rd October 2025
    {
        title: "Welcoming Guests",
        startTime: "08:30",
        endTime: "08:45",
        date: "2025-10-03",
        speaker: "Amina Kaunda and Honey (MCs)",
        location: "Intercontinental Hotel, Lusaka",
        category: "other",
        order: 22,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Summit Opening Remarks",
        startTime: "08:45",
        endTime: "09:00",
        date: "2025-10-03",
        speaker: "Dr. Brian Manchishi - Deputy Registrar, Insurance - PIA",
        location: "Intercontinental Hotel, Lusaka",
        category: "keynote",
        order: 23,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Keynote Remarks",
        startTime: "09:00",
        endTime: "09:30",
        date: "2025-10-03",
        speaker: "Elias Omondi (Principal, Innovation for Resilience - FSD Africa), Mrs Lillian Chilongo-Kangwa (CEO, FSD Zambia), British High Commissioner to Zambia (Ms Rebecca Terzeon)",
        location: "Intercontinental Hotel, Lusaka",
        category: "keynote",
        order: 24,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "The Future of Insurance in Africa: Collaborating for Innovation to Increase Access for the Underserved",
        startTime: "09:30",
        endTime: "09:45",
        date: "2025-10-03",
        speaker: "Hon. Felix Mutati - Minister of Technology & Science Republic of Zambia",
        location: "Intercontinental Hotel, Lusaka",
        category: "keynote",
        order: 25,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Ministerial Fireside Chat: Policy and Regulatory Approaches to Accelerate Insurtech Solutions",
        startTime: "09:45",
        endTime: "10:30",
        date: "2025-10-03",
        speaker: "Moderator: Elias Omondi | Panelists: Hon Felix Mutati (Minister of Technology and Science, Republic of Zambia), Hon Emma Theofelus (Minister of Information and Communication Technology, Namibia), British High Commissioner to Zambia (Ms Rebecca Terzeon)",
        location: "Intercontinental Hotel, Lusaka",
        category: "panel",
        order: 26,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "BimaLab 2025 Insurtechs Showcase",
        description: "A showcase of the insurtechs and innovative solutions in the 2025 BimaLab cohort",
        startTime: "10:30",
        endTime: "11:00",
        date: "2025-10-03",
        speaker: "Tonia Mutiso - CEO, Tellistic Technologies",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 27,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Tea Break / Media Engagement / Q & A",
        startTime: "11:00",
        endTime: "11:30",
        date: "2025-10-03",
        location: "Intercontinental Hotel, Lusaka",
        category: "break",
        isBreak: true,
        order: 28,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "PIA Regulatory Sandbox Framework and Roadmap",
        startTime: "11:30",
        endTime: "11:45",
        date: "2025-10-03",
        speaker: "Doreen K Silungwe - Head of Corporate Communications, PIA",
        location: "Intercontinental Hotel, Lusaka",
        category: "presentation",
        order: 29,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Insurtech Innovation Panel & Showcase",
        description: "A guided panel with BimaLab Africa Insurtech innovations showcasing their solutions and sharing insights and challenges to scaling cutting edge solutions",
        startTime: "11:45",
        endTime: "12:15",
        date: "2025-10-03",
        speaker: "Moderator: Lukonga Lindunda (Bongo Hive CEO) | Panelists: Chari (Morocco), Kifiya (Ethiopia), Maisha Poa (Kenya), Microinsurance Services (Malawi), Turaco (Kenya, Uganda, Nigeria, Ghana)",
        location: "Intercontinental Hotel, Lusaka",
        category: "panel",
        order: 30,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Panel Discussion: Unlocking Innovation in Insurance - Collaboration is Key",
        description: "The role of collaboration between insurers, regulators, and startups in fostering innovation. Key challenges and barriers in creating inclusive insurance products for underserved populations. How collaboration can drive regulatory change and help scale innovative solutions across Africa.",
        startTime: "12:15",
        endTime: "13:00",
        date: "2025-10-03",
        speaker: "Moderator: Andrew Nkolola (Director and Co-Founder of Mzanu Financial Services) | Panelists: Mercy Munoni (Ministry of Finance and Planning), Mwangala Mwiya (Hobbiton), Kachiza Kwenda (CEO, Prudential Life), MTN/MTN Money",
        location: "Intercontinental Hotel, Lusaka",
        category: "panel",
        order: 31,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Lunch",
        startTime: "13:00",
        endTime: "14:00",
        date: "2025-10-03",
        location: "Intercontinental Hotel, Lusaka",
        category: "break",
        isBreak: true,
        order: 32,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Panel Discussion: The Regulatory Landscape for Innovation in African Insurance",
        description: "The importance of regulatory support for insurtechs and insurers. Lessons learned from other African countries with advanced regulatory frameworks. Regulatory sandbox and Regulatory Tools for innovation",
        startTime: "14:00",
        endTime: "15:00",
        date: "2025-10-03",
        speaker: "Moderator: CGAP | Panelists: Naomi Pilula (Legal and Compliance expert), Chishiba Kabungo (Insurance Supervision, PIA), Rita Apau (Head Insurtech and Innovation, NIC), Kenneth Aroh (Head, Innovation Hub, NAICOM Nigeria)",
        location: "Intercontinental Hotel, Lusaka",
        category: "panel",
        order: 33,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Closing Remarks and Call to Action",
        description: "Summary of the Summit's key insights and commitments",
        startTime: "15:00",
        endTime: "15:15",
        date: "2025-10-03",
        speaker: "Yizaso Musonda - Manager, Market Development, PIA",
        location: "Intercontinental Hotel, Lusaka",
        category: "other",
        order: 34,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Economic Roundtable - SIDE EVENT 1",
        description: "Implications of 2026 National Budget on (Re)insurance Companies. Exclusive for Gralix clients and Diamond Sponsor CEOs.",
        startTime: "15:15",
        endTime: "17:00",
        date: "2025-10-03",
        speaker: "Moderator: Monica Musonda (Chairperson, Gralix Group), Jito Kayumba (Special Assistant to the President, Economics), CEOs of Gralix's Clients and Diamond Sponsor CEOs",
        location: "Intercontinental Hotel, Lusaka",
        category: "workshop",
        order: 35,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Beyond the Channel - Reinventing Sales & Distribution for the Future of Insurance - SIDE EVENT 2",
        description: "Discover cutting-edge sales and distribution models transforming insurance and financial services across Africa. Learn how innovation in these areas can drive growth, expand reach, and enhance customer engagement.",
        startTime: "15:15",
        endTime: "17:00",
        date: "2025-10-03",
        speaker: "Facilitator: Andrew Waititu",
        location: "Intercontinental Hotel, Lusaka",
        category: "workshop",
        order: 36,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Regulatory Innovation for Inclusive Insurance and Financial Access - SIDE EVENT 3",
        description: "A look at the tools and approaches the regulatory authorities can adopt to enable innovation solutions in the financial sector",
        startTime: "15:15",
        endTime: "17:00",
        date: "2025-10-03",
        speaker: "Facilitator: Neal Rischall & CGAP",
        location: "Intercontinental Hotel, Lusaka",
        category: "workshop",
        order: 37,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    },
    {
        title: "Closing Party",
        startTime: "17:30",
        endTime: "19:00",
        date: "2025-10-03",
        location: "Intercontinental Hotel, Lusaka",
        category: "networking",
        order: 38,
        createdBy: ADMIN_USER_ID,
        lastEditedBy: ADMIN_USER_ID
    }
];

export const populateGICAgenda = async () => {
    try {
        console.log('Starting GIC Agenda population...');

        const batch = firestore().batch();
        let successCount = 0;

        for (const agendaItem of gicAgendaData) {
            const itemData: Omit<AgendaItem, 'id'> = {
                ...agendaItem,
                eventId: EVENT_ID,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const docRef = firestore().collection('agendas').doc();
            batch.set(docRef, itemData);
            successCount++;
        }

        await batch.commit();

        console.log(`✅ Successfully populated ${successCount} agenda items for event ${EVENT_ID}`);
        return { success: true, count: successCount };
    } catch (error) {
        console.error('❌ Error populating GIC agenda:', error);
        return { success: false, error };
    }
};
import { AgendaItem } from '@/types/agenda';
import firestore from '@react-native-firebase/firestore';

// Helper function to convert date + time to sortable timestamp for ordaaa
const parseDateTime = (date: string, time: string): number => {
    try {
        // Parse the date (expecting formats like "2025-10-02" or "Oct 2, 2025")
        let parsedDate: Date;

        if (date.includes('-')) {
            // ISO format: "2025-10-02"
            parsedDate = new Date(date);
        } else {
            // Text format: "Oct 2, 2025" or "October 2, 2025"
            parsedDate = new Date(date);
        }

        // Parse time (expecting formats like "09:30", "9:30 AM", "14:30")
        const timeStr = time.toLowerCase().replace(/\s+/g, '');
        let hours = 0;
        let minutes = 0;

        if (timeStr.includes('am') || timeStr.includes('pm')) {
            // 12-hour format
            const isPM = timeStr.includes('pm');
            const cleanTime = timeStr.replace(/[ap]m/g, '');
            const [hourStr, minuteStr] = cleanTime.split(':');
            hours = parseInt(hourStr);
            minutes = parseInt(minuteStr) || 0;

            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
        } else {
            // 24-hour format
            const [hourStr, minuteStr] = time.split(':');
            hours = parseInt(hourStr);
            minutes = parseInt(minuteStr) || 0;
        }

        // Set the time on the date
        parsedDate.setHours(hours, minutes, 0, 0);

        return parsedDate.getTime();
    } catch (error) {
        console.warn('Error parsing date/time:', { date, time, error });
        // Fallback: return current time
        return Date.now();
    }
};

// Function to sort agenda items by date and time
const sortAgendaItems = (items: AgendaItem[]): AgendaItem[] => {
    return items.sort((a, b) => {
        const timestampA = parseDateTime(a.date, a.startTime);
        const timestampB = parseDateTime(b.date, b.startTime);

        // Primary sort: by date/time
        if (timestampA !== timestampB) {
            return timestampA - timestampB;
        }

        // Secondary sort: by creation time (for items at same time)
        return a.createdAt - b.createdAt;
    });
};

export const agendaService = {
    // Get agenda items for an event - now sorted by date/time
    getEventAgenda: async (eventId: string): Promise<AgendaItem[]> => {
        try {
            const snapshot = await firestore()
                .collection('agendas')
                .where('eventId', '==', eventId)
                // Remove orderBy - we'll sort in memory by date/time
                .get();

            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AgendaItem[];

            // Sort by date and time
            return sortAgendaItems(items);
        } catch (error) {
            console.error('Error fetching agenda:', error);
            throw error;
        }
    },

    // Listen to real-time agenda updates - now sorted by date/time
    subscribeToAgenda: (eventId: string, callback: (items: AgendaItem[]) => void) => {
        return firestore()
            .collection('agendas')
            .where('eventId', '==', eventId)
            // Remove orderBy - we'll sort in memory
            .onSnapshot(
                (snapshot) => {
                    const items = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as AgendaItem[];

                    // Sort by date and time before calling callback
                    const sortedItems = sortAgendaItems(items);
                    callback(sortedItems);
                },
                (error) => {
                    console.error('Error listening to agenda updates:', error);
                }
            );
    },

    // Create new agenda item (Admin only) - auto-position by time
    createAgendaItem: async (eventId: string, item: Omit<AgendaItem, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
        try {
            // Calculate auto-order based on date/time for backward compatibility
            // (Some existing code might still reference order field)
            const existingItems = await agendaService.getEventAgenda(eventId);
            const newTimestamp = parseDateTime(item.date, item.startTime);

            // Find position where this item should be inserted
            let autoOrder = 1;
            for (const existingItem of existingItems) {
                const existingTimestamp = parseDateTime(existingItem.date, existingItem.startTime);
                if (newTimestamp > existingTimestamp) {
                    autoOrder = Math.max(autoOrder, (existingItem.order || 0) + 1);
                }
            }

            const newItem: Omit<AgendaItem, 'id'> = {
                ...item,
                eventId,
                order: autoOrder, // Keep for backward compatibility but not used for sorting
                createdAt: Date.now(),
                updatedAt: Date.now(),
                createdBy: userId,
                lastEditedBy: userId,
            };

            const docRef = await firestore()
                .collection('agendas')
                .add(newItem);

            return docRef.id;
        } catch (error) {
            console.error('Error creating agenda item:', error);
            throw error;
        }
    },

    // Update agenda item (Admin only)
    updateAgendaItem: async (itemId: string, updates: Partial<AgendaItem>, userId: string): Promise<void> => {
        try {
            await firestore()
                .collection('agendas')
                .doc(itemId)
                .update({
                    ...updates,
                    updatedAt: Date.now(),
                    lastEditedBy: userId,
                });
        } catch (error) {
            console.error('Error updating agenda item:', error);
            throw error;
        }
    },


    // Delete agenda item (Admin only)
    deleteAgendaItem: async (itemId: string): Promise<void> => {
        try {
            await firestore()
                .collection('agendas')
                .doc(itemId)
                .delete();
        } catch (error) {
            console.error('Error deleting agenda item:', error);
            throw error;
        }
    },

    // Reorder agenda items (Admin only) - DEPRECATED but kept for compatibility
    reorderAgendaItems: async (items: { id: string; order: number }[], userId: string): Promise<void> => {
        console.warn('reorderAgendaItems is deprecated - items are now auto-sorted by date/time');
        try {
            const batch = firestore().batch();

            items.forEach(item => {
                const itemRef = firestore().collection('agendas').doc(item.id);
                batch.update(itemRef, {
                    order: item.order,
                    updatedAt: Date.now(),
                    lastEditedBy: userId,
                });
            });

            await batch.commit();
        } catch (error) {
            console.error('Error reordering agenda items:', error);
            throw error;
        }
    },

    // Set current live agenda item (Admin only)
    setCurrentAgendaItem: async (eventId: string, itemId: string | null): Promise<void> => {
        try {
            const eventRef = firestore().collection('events').doc(eventId);
            await eventRef.update({
                currentAgendaItem: itemId,
                agendaLastUpdated: Date.now(),
            });
        } catch (error) {
            console.error('Error setting current agenda item:', error);
            throw error;
        }
    },
    // 🆕 SELECT SIMULTANEOUS EVENT (Attendee action)
    selectSimultaneousEvent: async (
        itemId: string,
        userId: string,
        simultaneousGroupId: string
    ): Promise<void> => {
        try {
            const batch = firestore().batch();

            // Get all items in this simultaneous group
            const groupItems = await firestore()
                .collection('agendas')
                .where('simultaneousGroupId', '==', simultaneousGroupId)
                .get();

            groupItems.forEach(doc => {
                const itemRef = firestore().collection('agendas').doc(doc.id);

                if (doc.id === itemId) {
                    // Add user to selected event
                    batch.update(itemRef, {
                        attendeeSelections: firestore.FieldValue.arrayUnion(userId),
                        updatedAt: Date.now()
                    });
                } else {
                    // Remove user from other events in the group
                    batch.update(itemRef, {
                        attendeeSelections: firestore.FieldValue.arrayRemove(userId),
                        updatedAt: Date.now()
                    });
                }
            });

            await batch.commit();
        } catch (error) {
            console.error('Error selecting simultaneous event:', error);
            throw error;
        }
    },

    // 🆕 GET ATTENDEE'S SELECTION FOR A GROUP
    getAttendeeSelection: async (
        simultaneousGroupId: string,
        userId: string
    ): Promise<string | null> => {
        try {
            const groupItems = await firestore()
                .collection('agendas')
                .where('simultaneousGroupId', '==', simultaneousGroupId)
                .get();

            for (const doc of groupItems.docs) {
                const data = doc.data() as AgendaItem;
                if (data.attendeeSelections?.includes(userId)) {
                    return doc.id; // Return the selected item ID
                }
            }

            return null; // No selection made
        } catch (error) {
            console.error('Error getting attendee selection:', error);
            throw error;
        }
    },

    // 🆕 GET SELECTION STATS (Admin only)
    getSimultaneousEventStats: async (
        simultaneousGroupId: string
    ): Promise<Array<{ id: string; title: string; selectionCount: number }>> => {
        try {
            const groupItems = await firestore()
                .collection('agendas')
                .where('simultaneousGroupId', '==', simultaneousGroupId)
                .orderBy('startTime', 'asc')
                .get();

            return groupItems.docs.map(doc => {
                const data = doc.data() as AgendaItem;
                return {
                    id: doc.id,
                    title: data.title,
                    selectionCount: data.attendeeSelections?.length || 0
                };
            });
        } catch (error) {
            console.error('Error getting simultaneous event stats:', error);
            throw error;
        }
    },
};

import { AgendaItem } from '@/types/agenda';
import firestore from '@react-native-firebase/firestore';

export const agendaService = {
    // Get agenda items for an event
    getEventAgenda: async (eventId: string): Promise<AgendaItem[]> => {
        try {
            const snapshot = await firestore()
                .collection('agendas')
                .where('eventId', '==', eventId)
                .orderBy('order', 'asc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AgendaItem[];
        } catch (error) {
            console.error('Error fetching agenda:', error);
            throw error;
        }
    },

    // Listen to real-time agenda updates
    subscribeToAgenda: (eventId: string, callback: (items: AgendaItem[]) => void) => {
        return firestore()
            .collection('agendas')
            .where('eventId', '==', eventId)
            .orderBy('order', 'asc')
            .onSnapshot(
                (snapshot) => {
                    const items = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as AgendaItem[];
                    callback(items);
                },
                (error) => {
                    console.error('Error listening to agenda updates:', error);
                }
            );
    },

    // Create new agenda item (Admin only)
    createAgendaItem: async (eventId: string, item: Omit<AgendaItem, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
        try {
            const newItem: Omit<AgendaItem, 'id'> = {
                ...item,
                eventId,
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

    // Reorder agenda items (Admin only)
    reorderAgendaItems: async (items: { id: string; order: number }[], userId: string): Promise<void> => {
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
    }
};
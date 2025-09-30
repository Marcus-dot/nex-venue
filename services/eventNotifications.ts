export const eventNotificationService = {
    // Prepare notification for new event created
    prepareNewEventNotification: (
        eventId: string,
        eventTitle: string,
        creatorName: string,
    ) => {
        return {
            type: 'new_event' as const,
            title: 'New Event Near You',
            body: `${creatorName} created "${eventTitle}"`,
            data: {
                type: 'new_event' as const,
                eventId,
                creatorName,
            }
        };
    },

    // Prepare notification for event update
    prepareEventUpdateNotification: (
        eventId: string,
        eventTitle: string,
        updateType: string,
    ) => {
        return {
            type: 'event_update' as const,
            title: `${eventTitle} Updated`,
            body: `The event has been updated: ${updateType}`,
            data: {
                type: 'event_update' as const,
                eventId,
            }
        };
    },

    // Prepare notification for event reminder
    prepareEventReminderNotification: (
        eventId: string,
        eventTitle: string,
        timeUntilStart: string,
    ) => {
        return {
            type: 'event_reminder' as const,
            title: 'Event Starting Soon',
            body: `${eventTitle} starts ${timeUntilStart}`,
            data: {
                type: 'event_reminder' as const,
                eventId,
            }
        };
    },

    // Prepare notification for new attendee
    prepareNewAttendeeNotification: (
        eventId: string,
        eventTitle: string,
        attendeeName: string,
    ) => {
        return {
            type: 'new_attendee' as const,
            title: `New Attendee for ${eventTitle}`,
            body: `${attendeeName} is now attending your event`,
            data: {
                type: 'new_attendee' as const,
                eventId,
                attendeeName,
            }
        };
    },
};
/**
 * Firebase Realtime Database and Firestore Schemas for VenueIQ
 */

// Firestore Collections (Static Data)
export const venueMapSchema = {
    venueMap: { // collection
        "gate-a": { // document
            id: "gate-a",
            name: "Main Gate A",
            location: { lat: 37.7749, lng: -122.4194 },
            type: "entrance", // entrance, exit
            capacity: 5000
        },
        "stall-1": { // document
            id: "stall-1",
            name: "Burger & Co.",
            location: { lat: 37.7750, lng: -122.4195 },
            type: "food", // food, merch, restroom
        }
    }
};

// Realtime Database Nodes (Dynamic Data)
export const realtimeSchemas = {
    crowdZones: {
        "zone-north": {
            id: "zone-north",
            name: "North Concourse",
            currentOccupancy: 850,
            maxCapacity: 1000,
            density: "high", // low, medium, high
            lastUpdated: "timestamp"
        }
    },
    waitTimes: {
        "stall-1": {
            id: "stall-1",
            waitTimeMinutes: 15,
            queueLength: 30,
            trend: "increasing", // increasing, decreasing, stable
            lastUpdated: "timestamp"
        }
    },
    alerts: {
        "alert-1": {
            id: "alert-1",
            type: "crowd_surge", // crowd_surge, emergency, general_info
            message: "High crowd volume at Gate A. Please use Gate B for faster entry.",
            priority: "high",
            timestamp: "timestamp_val",
            active: true
        }
    }
};

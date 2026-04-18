import { rtdb } from './config';
import { ref, set } from 'firebase/database';

export const mockCrowdZones = {
    "zone-main-stage": {
        id: "zone-main-stage", name: "Main Stage Area",
        currentOccupancy: 8500, maxCapacity: 10000, density: "high", lastUpdated: Date.now()
    },
    "zone-food-court": {
        id: "zone-food-court", name: "Central Food Court",
        currentOccupancy: 1200, maxCapacity: 2000, density: "medium", lastUpdated: Date.now()
    },
    "zone-vip": {
        id: "zone-vip", name: "VIP Lounge",
        currentOccupancy: 150, maxCapacity: 500, density: "low", lastUpdated: Date.now()
    },
    "zone-merch-north": {
        id: "zone-merch-north", name: "North Merch Tent",
        currentOccupancy: 450, maxCapacity: 500, density: "high", lastUpdated: Date.now()
    },
    "zone-parking-a": {
        id: "zone-parking-a", name: "Parking Deck A",
        currentOccupancy: 1900, maxCapacity: 2000, density: "high", lastUpdated: Date.now()
    },
    "zone-medical": {
        id: "zone-medical", name: "Medical Tent 1",
        currentOccupancy: 12, maxCapacity: 50, density: "low", lastUpdated: Date.now()
    }
};

export const mockWaitTimes = {
    "stall-burger": { id: "stall-burger", name: "Smash Burgers", waitTimeMinutes: 25, queueLength: 45, trend: "increasing", lastUpdated: Date.now() },
    "stall-beer": { id: "stall-beer", name: "Craft Beer Station", waitTimeMinutes: 12, queueLength: 20, trend: "stable", lastUpdated: Date.now() },
    "stall-vegan": { id: "stall-vegan", name: "Vegan Bites", waitTimeMinutes: 5, queueLength: 8, trend: "decreasing", lastUpdated: Date.now() },
    "restroom-east": { id: "restroom-east", name: "East Restrooms", waitTimeMinutes: 18, queueLength: 30, trend: "increasing", lastUpdated: Date.now() },
    "restroom-vip": { id: "restroom-vip", name: "VIP Washrooms", waitTimeMinutes: 0, queueLength: 0, trend: "stable", lastUpdated: Date.now() },
    "ride-ferris": { id: "ride-ferris", name: "Ferris Wheel", waitTimeMinutes: 40, queueLength: 80, trend: "increasing", lastUpdated: Date.now() }
};

export const mockAlerts = {
    "alert-weather": {
        id: "alert-weather", type: "weather_advisory",
        message: "Light rain approaching in 15 minutes. Covered areas remain open.",
        priority: "normal", timestamp: Date.now(), active: true
    },
    "alert-traffic": {
        id: "alert-traffic", type: "traffic_update",
        message: "Heavy traffic on Main St. Please use South Exit when leaving.",
        priority: "normal", timestamp: Date.now() - 60000, active: true
    },
    "alert-surge": {
        id: "alert-surge", type: "crowd_surge",
        message: "Main Stage is nearing capacity. Please refer to side screens.",
        priority: "high", timestamp: Date.now() - 120000, active: true
    }
};

export const initializeMockRealtimeDb = async () => {
    try {
        await set(ref(rtdb, 'crowdZones'), mockCrowdZones);
        await set(ref(rtdb, 'waitTimes'), mockWaitTimes);
        await set(ref(rtdb, 'alerts'), mockAlerts);
        console.log("Mock Realtime DB initialized.");
    } catch (e) {
        console.error("Error init Realtime DB mock data:", e);
    }
};

const {ObjectId} = require("mongodb");
const mongoService = require("./mongoservice");

class EventService {
    async listEvents() {
        return (await mongoService.getDb()).collection('events').find({}).toArray();
    }

    async findEventByID(eventID) {
        return (await mongoService.getDb()).collection('events').findOne({ _id: new ObjectId(eventID) });
    }

    async findEventsByVenueID(venueID) {
        const db = await mongoService.getDb();
        const venueObjectID = new ObjectId(venueID);
        return await db.collection('events').find({ venueID: venueObjectID }).toArray();
    }

    async findEventByIdAndVenueID(venueID, eventID) {
        const db = await mongoService.getDb();
        const venueObjectID = new ObjectId(venueID);
        const eventObjectID = new ObjectId(eventID);
        return await db.collection('events').findOne({_id: eventObjectID, venueID: venueObjectID});
    }

    async addEvent({ venueID, name, dateTime, ticketPrice }) {
        const db = await mongoService.getDb();
        const venueObjectID = new ObjectId(venueID);
        const venueExists = await db.collection('venues').findOne({ _id: venueObjectID });
        if (!venueExists)
            throw new Error("Venue not found");

        const newEvent = {
            venueID: venueObjectID,
            name,
            dateTime,
            ticketPrice
        };

        const result = await db.collection('events').insertOne(newEvent);
        return db.collection('events').findOne({ _id: result.insertedId });
    }

    async deleteEvent(eventID) {
        const db = await mongoService.getDb();
        const eventObjectID = new ObjectId(eventID);
        const eventResult = await db.collection('events').deleteOne({ _id: eventObjectID });
        if (eventResult.deletedCount === 0)
            throw new Error("Event not found");

        return { message: `Event with ID ${eventID} has been removed.` };
    }
}

module.exports = new EventService();
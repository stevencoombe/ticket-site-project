const {ObjectId} = require("mongodb");
const mongoService = require("./mongoservice");

class VenueService {
    async listVenues() {
        return (await mongoService.getDb()).collection('venues').find({}).toArray();
    }

    async findVenueByID(venueID) {
        return (await mongoService.getDb()).collection('venues').findOne({ _id: new ObjectId(venueID) });
    }

    async addVenue(newVenue) {
        const db = await mongoService.getDb();
        const result = await db.collection('venues').insertOne(newVenue);
        return db.collection('venues').findOne({ _id: result.insertedId });
    }

    async deleteVenue(venueID) {
        const db = await mongoService.getDb();
        const venueObjectID = new ObjectId(venueID);
        const venueResult = await db.collection('venues').deleteOne({ _id: venueObjectID });
        if (venueResult.deletedCount === 0)
            throw new Error("Venue not found");

        await db.collection('events').deleteMany({ venueID: venueObjectID });
        return { message: `Venue with ID ${venueID} has been removed, along with all associated events.` };
    }
}

module.exports = new VenueService();
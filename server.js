const fastify = require('fastify')({ logger: true });
const { venueSchema, eventSchema } = require('./schemas');
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');
const url = "mongodb+srv://test:test@cluster0.64toza8.mongodb.net/?retryWrites=true&w=majority";
const mongoClient = new MongoClient(url);
let db;

mongoClient.connect(err => {
    if (err) {
        console.error("Failed to connect to MongoDB", err);
        return;
    }
    db = mongoClient.db("ticketing");
    console.log("Connected successfully to MongoDB");
});

//Get venues
fastify.get('/venues', async (request, reply) => {
    return await db.collection('venues').find({}).toArray();
});

//Get events
fastify.get('/events', async (request, reply) => {
    return await db.collection('events').find({}).toArray();
});

//Get a specific venue ID
fastify.get('/venues/:venueID', async (request, reply) => {
    let venueID;
    try {
        venueID = new ObjectId(request.params.venueID);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid venue ID format" });
    }
    const venue = await db.collection('venues').findOne({ _id: venueID });

    if (!venue)
        return reply.code(404).send({ message: "Venue not found" });

    return venue;
});

//Get a specific event ID
fastify.get('/events/:eventID', async (request, reply) => {
    let eventID;
    try {
        eventID = new ObjectId(request.params.eventID);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid event ID format" });
    }
    const event = await db.collection('events').findOne({ _id: eventID });

    if (!event)
        return reply.code(404).send({ message: "Event not found" });

    return event;
});

// Get all events for a specific venue
fastify.get('/venues/:venueID/events', async (request, reply) => {
    let venueID;
    try {
        venueID = new ObjectId(request.params.venueID);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid venue ID format" });
    }
    const events = await db.collection('events').find({ venueID: venueID }).toArray();
    if (!events)
        return reply.code(404).send({ message: "No events found for this venue" });

    return events;
});

// Get a specific event in a specific venueID
fastify.get('/venues/:venueID/events/:eventID', async (request, reply) => {
    let venueID, eventID;
    try {
        venueID = new ObjectId(request.params.venueID);
        eventID = new ObjectId(request.params.eventID);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid ID format" });
    }

    const venue = await db.collection('venues').findOne(
        { _id: venueID, "events._id": eventID },
        { projection: { events: { $elemMatch: { _id: eventID } } } }
    );

    if (!venue || !venue.events || venue.events.length === 0)
        return reply.code(404).send({ message: "Event not found" });

    return venue.events[0];
});

fastify.post('/venues', { schema: venueSchema }, async (request, reply) => {
    const newVenue = request.body;

    const result = await db.collection('venues').insertOne(newVenue);
    const createdVenue = await db.collection('venues').findOne({ _id: result.insertedId });

    reply.code(201).send(createdVenue);
});

fastify.post('/events', { schema: eventSchema }, async (request, reply) => {
    const { venueID, name, dateTime, ticketPrice } = request.body;
    let venueObjectId;
    try {
        venueObjectId = new ObjectId(venueID);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid venue ID format" });
    }
    const venueExists = await db.collection('venues').findOne({ _id: venueObjectId });

    if (!venueExists) {
        return reply.code(404).send({ message: "Venue not found" });
    }

    const newEvent = {
        venueID: venueObjectId,
        name,
        dateTime,
        ticketPrice
    };

    const result = await db.collection('events').insertOne(newEvent);
    const createdEvent = await db.collection('events').findOne({ _id: result.insertedId });

    reply.code(201).send(createdEvent);
});

fastify.delete('/venues/:venueID', async (request, reply) => {
    const venueID = new ObjectId(request.params.venueID);
    const venueResult = await db.collection('venues').deleteOne({ _id: venueID });

    if (venueResult.deletedCount === 0)
        return reply.code(404).send({ message: "Venue not found" });

    await db.collection('events').deleteMany({ venueID: venueID });
    return { message: `Venue with ID ${venueId} has been removed.` };
});

fastify.delete('/events/:eventID', async (request, reply) => {
    const eventID = new ObjectId(request.params.eventID);

    const eventResult = await db.collection('events').deleteOne({ _id: eventID });
    if (eventResult.deletedCount === 0)
        return reply.code(404).send({ message: "Event not found" });

    return { message: `Event with ID ${eventID} has been removed.` };
});

const start = async () => {
    try {
        await mongoClient.connect();
        db = mongoClient.db("ticketing");
        console.log("Connected successfully to MongoDB");

        await fastify.listen({ port: 3001 });
        console.log(`Server listening on ${fastify.server.address().port}`);
    } catch (err) {
        console.error("Failed to start the server:", err);
        process.exit(1);
    }
};

start().catch(err => {
    console.error(err);
    process.exit(1);
});
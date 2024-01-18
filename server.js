const fs = require('fs');
const util = require('util');

const fastify = require('fastify')({ logger: true });

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

//Get a specific venue ID
fastify.get('/venues/:venueId', async (request, reply) => {
    let venueId;
    try {
        venueId = new ObjectId(request.params.venueId);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid venue ID format" });
    }
    const venue = await db.collection('venues').findOne({ _id: venueId });

    if (!venue) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    return venue;
});

// Get events in a specific venueID
fastify.get('/venues/:venueId/events', async (request, reply) => {
    let venueId;
    try {
        venueId = new ObjectId(request.params.venueId);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid venue ID format" });
    }
    const venue = await db.collection('venues').findOne({ _id: venueId }, { projection: { events: 1 } });

    if (!venue) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    return venue.events || [];
});

// Get a specific event in a specific venueID
fastify.get('/venues/:venueId/events/:eventId', async (request, reply) => {
    let venueId, eventId;
    try {
        venueId = new ObjectId(request.params.venueId);
        eventId = new ObjectId(request.params.eventId);
    } catch (err) {
        return reply.code(400).send({ message: "Invalid ID format" });
    }

    const venue = await db.collection('venues').findOne(
        { _id: venueId, "events._id": eventId },
        { projection: { events: { $elemMatch: { _id: eventId } } } }
    );

    if (!venue || !venue.events || venue.events.length === 0) {
        return reply.code(404).send({ message: "Event not found" });
    }
    return venue.events[0];
});

fastify.post('/venues', async (request, reply) => {
    const { name, address, maxCapacity } = request.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return reply.code(400).send({ message: "Invalid or missing venue name" });
    }
    if (!address || typeof address !== 'string' || address.trim() === '') {
        return reply.code(400).send({ message: "Invalid or missing address" });
    }
    if (isNaN(maxCapacity) || maxCapacity === undefined) {
        return reply.code(400).send({ message: "Invalid or missing maxCapacity" });
    }

    const newVenue = { name, address, maxCapacity };

    const result = await db.collection('venues').insertOne(newVenue);
    const createdVenue = await db.collection('venues').findOne({ _id: result.insertedId });

    reply.code(201).send(createdVenue);
});

fastify.post('/venues/:venueId/events', async (request, reply) => {
    const venueId = new ObjectId(request.params.venueId);
    const { name, dateTime, ticketPrice } = request.body;
    if (!name || !dateTime || ticketPrice === undefined) {
        return reply.code(400).send({ message: "Missing required event fields: name, dateTime, and ticketPrice" });
    }

    const newEvent = {
        _id: new ObjectId(),
        name,
        dateTime,
        ticketPrice
    };

    const result = await db.collection('venues').updateOne(
        { _id: venueId },
        { $push: { events: newEvent } }
    );

    if (result.matchedCount === 0) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    reply.code(201).send(newEvent);
});

fastify.delete('/venues/:venueId', async (request, reply) => {
    const venueId = new ObjectId(request.params.venueId);
    const result = await db.collection('venues').deleteOne({ _id: venueId });
    if (result.deletedCount === 0) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    return { message: `Venue with ID ${venueId} has been removed.` };
});

fastify.delete('/venues/:venueId/events/:eventId', async (request, reply) => {
    const venueId = new ObjectId(request.params.venueId);
    const eventId = new ObjectId(request.params.eventId);
    const result = await db.collection('venues').updateOne(
        { _id: venueId },
        { $pull: { events: { _id: eventId } } }
    );

    if (result.matchedCount === 0) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    if (result.modifiedCount === 0) {
        return reply.code(404).send({ message: "Event not found" });
    }
    return { message: `Event with ID ${eventId} has been removed from venue ${venueId}.` };
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
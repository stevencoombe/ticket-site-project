const fastify = require('fastify')({ logger: true });
const { venueSchema, eventSchema } = require('./schemas');
const venueService = require('./venueservice');
const eventService = require('./eventservice');
const mongoService = require('./mongoservice');

fastify.get('/venues', async () => {
    return await venueService.listVenues();
});

fastify.get('/venues/:venueID', async (request, reply) => {
    try {
        const venue = await venueService.findVenueByID(request.params.venueID);
        if (!venue)
            return reply.code(404).send({ message: "Venue not found" });

        return venue;
    } catch (err) {
        return reply.code(400).send({ message: "Invalid venue ID format" });
    }
});

fastify.post('/venues', { schema: venueSchema }, async (request, reply) => {
    const newVenue = request.body;
    const createdVenue = await venueService.addVenue(newVenue);
    reply.code(201).send(createdVenue);
});

fastify.delete('/venues/:venueID', async (request, reply) => {
    try {
        const message = await venueService.deleteVenue(request.params.venueID);
        reply.send(message);
    } catch (err) {
        if (err.message === "Venue not found") {
            return reply.code(404).send({message: err.message});
        }
    }
});

fastify.get('/events', async () => {
    return await eventService.listEvents();
});

fastify.get('/events/:eventID', async (request, reply) => {
    try {
        const event = await eventService.findEventByID(request.params.eventID);
        if (!event)
            return reply.code(404).send({ message: "Event not found" });

        return event;
    } catch (err) {
        return reply.code(400).send({ message: "Invalid event ID format" });
    }
});

fastify.get('/venues/:venueID/events', async (request, reply) => {
    try {
        const events = await eventService.findEventsByVenueID(request.params.venueID);
        if (!events)
            return reply.code(404).send({ message: "No events found for this venue" });

        return events;
    } catch (err) {
        return reply.code(400).send({ message: "Invalid venue ID format" });
    }
});

fastify.get('/venues/:venueID/events/:eventID', async (request, reply) => {
    try {
        const event = await eventService.findEventByIdAndVenueID(request.params.venueID, request.params.eventID);
        if (!event)
            return reply.code(404).send({ message: "Event not found" });

        return event;
    } catch (err) {
            return reply.code(400).send({ message: "Invalid ID format" });
    }
});

fastify.post('/events', { schema: eventSchema }, async (request, reply) => {
    try {
        const createdEvent = await eventService.addEvent(request.body);
        reply.code(201).send(createdEvent);
    } catch (err) {
        if (err.message === "Venue not found")
            return reply.code(404).send({ message: err.message });
        else
            return reply.code(400).send({ message: "Invalid venue ID format" });
    }
});

fastify.delete('/events/:eventID', async (request, reply) => {
    try {
        const message = await eventService.deleteEvent(request.params.eventID);
        reply.send(message);
    } catch (err) {
        if (err.message === "Event not found")
            return reply.code(404).send({ message: err.message });
    }
});

const start = async () => {
    try {
        await mongoService.connect();
        await fastify.listen({ port: 3001 });
        console.log(`Server listening on ${fastify.server.address().port}`);
    } catch (err) {
        console.error("Failed to start the server:", err);
    }
};

start().catch(err => {
    console.error(err);
    process.exit(1);
});
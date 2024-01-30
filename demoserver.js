const fastify = require('fastify')({ logger: true });
const { venueSchema, eventSchema } = require('./schemas');
//bson replicates mongoDB's ObjectID method
const { ObjectId } = require('bson');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

fastify.get('/demovenues', async (request, reply) => {
    try {
        const data = await readFile('./demovenues.json', 'utf8');
        const venues = JSON.parse(data);
        return venues;
    } catch (err) {
        console.error("Error loading venues:", err);
        reply.code(500).send({ message: "Failed to load demo venues" });
    }
});

fastify.get('/demoevents', async (request, reply) => {
    try {
        const data = await readFile('./demoevents.json', 'utf8');
        const events = JSON.parse(data);
        return events;
    } catch (err) {
        console.error("Error loading events:", err);
        reply.code(500).send({ message: "Failed to load demo events" });
    }
});

fastify.post('/demovenues', { schema: venueSchema }, async (request, reply) => {
    const { name, address, maxCapacity } = request.body;
    try {
        const data = await readFile('./demovenues.json', 'utf8');
        const venues = JSON.parse(data);
        const venueID = new ObjectId().toHexString();
        const newVenue = {
            venueID,
            name,
            address,
            maxCapacity
        };
        venues.push(newVenue);
        await writeFile('./demovenues.json', JSON.stringify(venues, null, 2), 'utf8');
        reply.code(201).send(newVenue);
    } catch (err) {
        console.error("Error saving new venue:", err);
        reply.code(500).send({ message: "Failed to save new venue" });
    }
});

fastify.post('/demoevents', { schema: eventSchema }, async (request, reply) => {
    const { venueID, name, dateTime, ticketPrice } = request.body;
    const venuesData = await readFile('./demovenues.json', 'utf8');
    const venues = JSON.parse(venuesData);
    const venueExists = venues.some(venue => venue.venueID === venueID);

    if (!venueExists) {
        return reply.code(404).send({ message: "Venue not found" });
    }

    try {
        const data = await readFile('./demoevents.json', 'utf8');
        const events = JSON.parse(data);

        const newEvent = {
            _id: new ObjectId().toHexString(),
            venueID,
            name,
            dateTime,
            ticketPrice
        };
        events.push(newEvent);

        await writeFile('./demoevents.json', JSON.stringify(events, null, 2), 'utf8');
        reply.code(201).send(newEvent);
    } catch (err) {
        console.error("Error saving new event:", err);
        reply.code(500).send({ message: "Failed to save new event" });
    }
});

fastify.delete('/demoevents/:eventId', async (request, reply) => {
    const eventId = request.params.eventId;

    try {
        const eventsData = await readFile('./demoevents.json', 'utf8');
        const events = JSON.parse(eventsData);
        const filteredEvents = events.filter(event => event._id !== eventId);
        if (events.length === filteredEvents.length)
            return reply.code(404).send({ message: "Event not found" });

        // Write the updated list back to the file
        await writeFile('./demoevents.json', JSON.stringify(filteredEvents, null, 2), 'utf8');

        return { message: `Event with ID ${eventId} has been removed.` };
    } catch (err) {
        console.error("Error deleting event:", err);
        reply.code(500).send({ message: "Failed to delete event" });
    }
});

fastify.delete('/demovenues/:venueId', async (request, reply) => {
    const venueId = request.params.venueId;

    try {
        const venuesData = await readFile('./demovenues.json', 'utf8');
        const venues = JSON.parse(venuesData);
        const venueExists = venues.some(venue => venue._id === venueId);

        if (!venueExists) {
            return reply.code(404).send({ message: "Venue not found" });
        }

        const updatedVenues = venues.filter(venue => venue._id !== venueId);
        await writeFile('./demovenues.json', JSON.stringify(updatedVenues, null, 2), 'utf8');

        // deletes any related events
        const eventsData = await readFile('./demoevents.json', 'utf8');
        const events = JSON.parse(eventsData);
        const updatedEvents = events.filter(event => event.venueID !== venueId);
        await writeFile('./demoevents.json', JSON.stringify(updatedEvents, null, 2), 'utf8');

        return { message: `Venue with ID ${venueId} has been removed.` };
    } catch (err) {
        console.error("Error deleting venue:", err);
        reply.code(500).send({ message: "Failed to delete venue" });
    }
});

// wipes JSON files clean
fastify.delete('/demovenues/clear', async (request, reply) => {
    try {
        await writeFile('./demovenues.json', JSON.stringify([], null, 2), 'utf8');
        return reply.send({ message: "All venues have been removed." });
    } catch (err) {
        console.error("Error clearing venues:", err);
        return reply.code(500).send({ message: "Failed to clear venues" });
    }
});

fastify.delete('/demoevents/clear', async (request, reply) => {
    try {
        await writeFile('./demoevents.json', JSON.stringify([], null, 2), 'utf8');
        return reply.send({ message: "All events have been removed." });
    } catch (err) {
        console.error("Error clearing events:", err);
        return reply.code(500).send({ message: "Failed to clear events" });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3001 });
        console.log(`Server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

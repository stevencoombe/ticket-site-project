const fs = require('fs');
const util = require('util');

const readJson = util.promisify(fs.readFile);
const writeJson = util.promisify(fs.writeFile);

const venueJson = 'venues.json';
const fastify = require('fastify')({ logger: true });

async function readVenues() {
    try {
        const data = await readJson(venueJson);
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function writeVenues(venues) {
    try {
        await writeJson(venueJson, JSON.stringify(venues, null, 2));
    } catch (err) {
        console.error(err);
    }
}

//Get venues
fastify.get('/venues', async (request, reply) => {
    return await readVenues();
});

//Get a specific venue ID
fastify.get('/venues/:venueId', async (request, reply) => {
    const venueId = parseInt(request.params.venueId, 10);
    const venues = await readVenues();
    const venue = venues.find(v => v.id === venueId);

    if (!venue) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    return venue;
});

// Get events in a specific venueID
fastify.get('/venues/:venueId/events', async (request, reply) => {
    const venueId = parseInt(request.params.venueId, 10);
    const venues = await readVenues();
    const venue = venues.find(v => v.id === venueId);

    if (!venue) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    return venue.events || [];
});

fastify.get('/venues/:venueId/events/:eventId', async (request, reply) => {
    const venueId = parseInt(request.params.venueId, 10);
    const eventId = parseInt(request.params.eventId, 10);
    const venues = await readVenues();
    const venue = venues.find(v => v.id === venueId);
    const event = venue.events.find(e => e.eventId === eventId);

    if (!venue) {
        return reply.code(404).send({ message: "Venue not found" });
    }
    if (!event) {
        return reply.code(404).send({ message: "Event not found" });
    }
    return event;
});

fastify.post('/venues', async (request, reply) => {
    const newVenue = request.body;
    const venues = await readVenues();

    newVenue.id = venues.length + 1;
    venues.push(newVenue);

    await writeVenues(venues);

    reply.code(201).send(newVenue);
});

fastify.post('/venues/:venueId/events', async (request, reply) => {
    const venueId = parseInt(request.params.venueId, 10);
    const { name, dateTime, ticketPrice } = request.body;
    let venues = await readVenues();
    const venueIndex = venues.findIndex(v => v.id === venueId);

    if (venueIndex === -1) {
        return reply.code(404).send({ message: "Venue not found" });
    }

    if (!name || !dateTime || ticketPrice === undefined) {
        return reply.code(400).send({ message: "Missing required event fields: name, dateTime, and ticketPrice" });
    }

    const newEvent = {
        eventId: (venues[venueIndex].events.length + 1) || 1,
        name,
        dateTime,
        ticketPrice
    };

    venues[venueIndex].events = venues[venueIndex].events || [];
    venues[venueIndex].events.push(newEvent);

    await writeVenues(venues);

    reply.code(201).send(newEvent);
});

fastify.delete('/venues/:venueId', async (request, reply) => {
    const venueId = parseInt(request.params.venueId, 10);
    let venues = await readVenues();
    const venueIndex = venues.findIndex(v => v.id === venueId);

    if (venueIndex === -1) {
        return reply.code(404).send({ message: "Venue not found" });
    }

    venues = venues.filter(v => v.id !== venueId);
    await writeVenues(venues);

    return { message: `Venue with ID ${venueId} has been removed.` };
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
start().catch(err => {
    console.error(err);
    process.exit(1);
});
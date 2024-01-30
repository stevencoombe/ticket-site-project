const venueSchema = {
    body: {
        type: 'object',
        required: ['name', 'address', 'maxCapacity'],
        additionalProperties: false,
        properties: {
            name: { type: 'string', minLength: 1 },
            address: { type: 'string', minLength: 1 },
            maxCapacity: { type: 'integer', minimum: 1 }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                address: { type: 'string' },
                maxCapacity: { type: 'integer' }
            }
        }
    }
};

const eventSchema = {
    body: {
        type: 'object',
        required: ['venueID', 'name', 'dateTime', 'ticketPrice'],
        additionalProperties: false,
        properties: {
            venueID: { type: 'string', pattern: "^[0-9a-fA-F]{24}$" },
            name: { type: 'string', minLength: 1 },
            dateTime: { type: 'string', minLength: 1 },
            ticketPrice: { type: 'number', minimum: 0 }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                venueID: { type: 'string' },
                name: { type: 'string' },
                dateTime: { type: 'string' },
                ticketPrice: { type: 'number' }
            }
        }
    }
};

module.exports = { venueSchema, eventSchema };
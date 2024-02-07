# ticket-site-project
This ticketing project uses both mongoDB and local JSON files.
- node server.js for mongoDB
- node demoserver.js for local JSON files

MongoDB string: mongodb+srv://test:test@cluster0.64toza8.mongodb.net/

Endpoint commands for mongoDB:
- GET http://localhost:3001/venues - Get venues
- GET http://localhost:3001/events - Get events
- GET http://localhost:3001/venues/{venueID} - Get a specific venue
- GET http://localhost:3001/events/{eventID} - Get a specific event
- GET http://localhost:3001/venues/{venueID}/events - Get all events in a specific venue
- GET http://localhost:3001/venues/{venueID}/events/{eventID} - Get a specific event in a specific venue
- POST http://localhost:3001/venues - Post a venue
- POST http://localhost:3001/events - Post an event
- DELETE http://localhost:3001/venues/{venueID} - Delete a specific venue
- DELETE http://localhost:3001/events/{eventID} - Delete a specific event

Endpoint commands for local JSON files:
- GET http://localhost:3001/venues - Get venues
- GET http://localhost:3001/events - Get events
- POST http://localhost:3001/venues - Post a venue
- POST http://localhost:3001/events - Post an event
- DELETE http://localhost:3001/venues/{venueID} - Delete a specific venue
- DELETE http://localhost:3001/events/{eventID} - Delete a specific event
- DELETE http://localhost:3001/venues/clear - Deletes all venues
- DELETE http://localhost:3001/events/clear - Deletes all events

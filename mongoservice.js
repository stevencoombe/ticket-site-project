const { MongoClient } = require('mongodb');

class MongoService {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect() {
        const url = "mongodb+srv://test:test@cluster0.64toza8.mongodb.net/?retryWrites=true&w=majority";

        try {
            this.client = new MongoClient(url);
            await this.client.connect();
            console.log("Connected successfully to MongoDB");
            this.db = this.client.db("ticketing");
        } catch (err) {
            console.error("Failed to connect to MongoDB", err);
            throw err;
        }
    }

    async getDb() {
        if (!this.db)
            await this.connect();

        return this.db;
    }
}

module.exports = new MongoService();

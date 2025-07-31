import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";


// creating client that will talk to the postgress database client
const client = new Client({
    connectionString: process.env.postgresqlURL
})

async function connectionWithDatabase() {
    console.log(process.env.postgresqlURL);

    try {
        const connection = await client.connect();
        console.log("connection success");

        // after connection creating tables inside the database
        try {
            const table = await createTables();

            console.log(table);
        } catch (error) {
            console.log(error);
            console.log("error creating table");
        }
    } catch(error) {
        console.log("error connecting with database");
    }
}

connectionWithDatabase();


async function createTables() {
    try {
        const result = await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(50) NOT NULL
        );`)
        return result;
    } catch (error) {
        throw error;
    }
}
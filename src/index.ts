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
            return;
        }

        // inserting data in database
        try {
            // const result = await insertUsersInDB("vc", "vchawla7000@gmail.com", "random124#");
            const result = await insertUserInDB("vc", "vchawla7000@gmail.com", "random1243")
            
            console.log("data is sucessfully inserted");
        } catch (error) {
            console.log("error in inserting data");
            console.log(error);
            return;
        }

        // getting the user based on the email
        try {
            const result = await getUserOnEmail("vchawla7000@gmail.com");

            console.log(result);

            if(!result.rows.length) {
                console.log("No user is found with the username");
                return
            }

            console.log(result.rows[0]); // since email is unique we will get only 1 user
        } catch (error) {
            console.log(error);
            return;
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

// SERIAL is data type in postgress just like _id in mongoDB that will automcatically increment when the data inserted, no need to expliclty send postgress data base will take care of that

async function insertUsersInDB(username: string, email: string, password: string) {
    try {

        // very bad can lead to "sql injection" can corrupt your databse ( do not use this syntax of creating querirs as it will cause the postgress to run this string as query  => if there is valid SQL Command inside it than it will automatically run that and leads to due bad side effects )

        // better way when attaching value to the database is provide value explicitly
        const query: string = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}');`
        console.log(query);
        const result = await client.query(query);
    } catch(error) {
        throw error;
    }
}


// when we have to insert values explicity inside query do not directly insert that it leads to SQL injection that currpts the data
async function insertUserInDB(username: string, email: string, password: string) {
    try {
        const query: string = `INSERT INTO users (username, email, password) VALUES($1, $2, $3)`;
        const values: string[] = [username, email, password];

        const insertion = await client.query(query, values);

        console.log("data is inserted sucessfully");
        console.log(insertion);

    } catch(error) {
        console.log("error in inserting data inside user table");
        throw error;
    }
}

async function getUserOnEmail(email: string) {

    try {
        const query: string = `SELECT * FROM users WHERE email=$1;`;
        const values: [string] = [email];

        const result = client.query(query, values);

        return result;
    } catch(error) {
        console.log("error in getting database on the user email");
        throw error;
    }
}
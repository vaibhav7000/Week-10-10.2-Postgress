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

        // try {
        //     const result = await sqlInjectionEg("vchawla7000@gmail.com", `DROP TABLE "public"."users"`);

        //     console.log("table is deleted");
        // } catch (error) {
        //     console.log(error);
        // }

        try {
            const result = await userAddressTable();
            console.log("finally");
        } catch (error) {
            console.log(error);
            return
        }

        try {
            const user = await getUserOnEmail("vchawla7000@gmail.com");
            
            if(!user.rows.length) {
                console.log("now user exist with this email");
                return;
            }

            const final = await addAddressOfUser(user.rows[0].id, "ASR", "IN", 143001, "Batala road");

            console.log("added address");
        } catch (error) {
            console.log(error);
        }


    } catch(error) {
        console.log("error connecting with database");
        return
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


async function sqlInjectionEg(email: string, userinput: string) {
    try {
        const result = await client.query(`SELECT * FROM users WHERE email = '${email}'; ${userinput}`);

        console.log("all data is deleted");
    } catch (error) {
        console.log("error in sql injection");
        throw error;
    }
}


async function userAddressTable() {
    try {
        // this is the syntax for creating the query at the end we are sending SQL Commands to the postgress database server
        const result = await client.query(`
            CREATE TABLE addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                city VARCHAR(100) NOT NULL,
                country VARCHAR(100) NOT NULL,
                street VARCHAR(100) NOT NULL,
                pincode INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )    
        `);

        // now the address table will only add new row if there is valid user_id send is present in the users table ( adding strictness when adding the data to the database )

        console.log(result);
        console.log("successfully created address table");

        return result;
    } catch(error) {
        console.log("error in creating address table");
        throw error;
    }
}


async function addAddressOfUser(user_id: number, city: string, country: string, pincode: number, street: string) {
    try {
        const query = "INSERT INTO addresses (user_id, city, country, pincode, street) VALUES ($1, $2, $3, $4, $5)"
        const values: (string | number) [] = [user_id, city, country, pincode, street];

        const result = await client.query(query, values);

        console.log("added address for particular user successfully");
    } catch (error) {
        console.log("error occurrd on adding address");
        throw error;
    }
}

/*

    Never insert user values directly inside the query and send it it leads to SQL injection because when doing this user value can be valid SQL query that postgress server will run and perform unecessay results.
    
    Always send user values inside it in form of $ syntax and then send the query to the postgress

*/
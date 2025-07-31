"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = require("pg");
// creating client that will talk to the postgress database client
const client = new pg_1.Client({
    connectionString: process.env.postgresqlURL
});
function connectionWithDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(process.env.postgresqlURL);
        try {
            const connection = yield client.connect();
            console.log("connection success");
            // after connection creating tables inside the database
            try {
                const table = yield createTables();
                console.log(table);
            }
            catch (error) {
                console.log(error);
                console.log("error creating table");
                return;
            }
            // inserting data in database
            try {
                // const result = await insertUsersInDB("vc", "vchawla7000@gmail.com", "random124#");
                const result = yield insertUserInDB("vc", "vchawla7000@gmail.com", "random1243");
                console.log("data is sucessfully inserted");
            }
            catch (error) {
                console.log("error in inserting data");
                console.log(error);
                return;
            }
            // getting the user based on the email
            try {
                const result = yield getUserOnEmail("vchawla7000@gmail.com");
                console.log(result);
                if (!result.rows.length) {
                    console.log("No user is found with the username");
                    return;
                }
                console.log(result.rows[0]); // since email is unique we will get only 1 user
            }
            catch (error) {
                console.log(error);
                return;
            }
        }
        catch (error) {
            console.log("error connecting with database");
        }
    });
}
connectionWithDatabase();
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(50) NOT NULL
        );`);
            return result;
        }
        catch (error) {
            throw error;
        }
    });
}
// SERIAL is data type in postgress just like _id in mongoDB that will automcatically increment when the data inserted, no need to expliclty send postgress data base will take care of that
function insertUsersInDB(username, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // very bad can lead to "sql injection" can corrupt your databse ( do not use this syntax of creating querirs as it will cause the postgress to run this string as query  => if there is valid SQL Command inside it than it will automatically run that and leads to due bad side effects )
            // better way when attaching value to the database is provide value explicitly
            const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}');`;
            console.log(query);
            const result = yield client.query(query);
        }
        catch (error) {
            throw error;
        }
    });
}
// when we have to insert values explicity inside query do not directly insert that it leads to SQL injection that currpts the data
function insertUserInDB(username, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = `INSERT INTO users (username, email, password) VALUES($1, $2, $3)`;
            const values = [username, email, password];
            const insertion = yield client.query(query, values);
            console.log("data is inserted sucessfully");
            console.log(insertion);
        }
        catch (error) {
            console.log("error in inserting data inside user table");
            throw error;
        }
    });
}
function getUserOnEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = `SELECT * FROM users WHERE email=$1;`;
            const values = [email];
            const result = client.query(query, values);
            return result;
        }
        catch (error) {
            console.log("error in getting database on the user email");
            throw error;
        }
    });
}

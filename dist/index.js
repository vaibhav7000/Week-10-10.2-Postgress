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

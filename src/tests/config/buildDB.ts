import logger from '../../middleware/winston';
import * as fs from 'fs';
import { mockMovies } from '../movies/movies.mockData';
import path from 'path';
import { Client, ClientConfig } from 'pg';
import mongoose from 'mongoose';
import { ratings as mockRatings } from '../rating/rating.mockData';
import ratingModel from '../../models/ratingModel';
// import { mockUser1 } from '../users/users.mockData';

interface IExpectedBuildDB {
    movies?: boolean;
    ratings?: boolean;
    users?: boolean;
}

const clearSchema = async (
    thisClient: Client | undefined | null
): Promise<void> => {
    try {
        if (!thisClient) return;
        await thisClient.query(`
                            DROP SCHEMA public CASCADE;
                            CREATE SCHEMA public;
                            GRANT ALL ON SCHEMA public TO postgres;
                            GRANT ALL ON SCHEMA public TO public;`);
    } catch (error) {
        logger.error(error.stack);
    }
};

let dbClient: Client;

export const createDB = async (): Promise<void> => {
    const clientConfig: ClientConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: 5432,
    };

    const dbName = process.env.DB_NAME;

    const client = new Client(clientConfig);

    try {
        await client.connect();

        // Check if the database exists
        const res = await client.query(
            `SELECT datname FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (res.rowCount !== 0) {
            dbClient = new Client({ ...clientConfig, database: dbName });
            await dbClient.connect();
            // db exists so clear all tables to ensure a clean slate
            await clearSchema(dbClient);

            logger.info(`Database ${dbName} cleared successfully.`);
        } else {
            // Database does not exist, so create it
            await client.query(`CREATE DATABASE ${dbName}`);
            dbClient = new Client({ ...clientConfig, database: dbName });
            await dbClient.connect();
            logger.info(`Database ${dbName} created successfully.`);
        }
    } catch (err) {
        logger.error('Error executing query', err.stack);
    }

    client.end();
};

import pool from '../../boot/database/db_connect';

const sql = fs.readFileSync(path.join(__dirname, 'setup.sql')).toString();
// let pool : Pool;
export const buildDB = async ({
    movies = false,
    ratings = false,
    // users = false,
}: IExpectedBuildDB): Promise<void> => {
    try {
        await createDB();
        await pool.query(sql);

        // MOVIES TABLE
        if (movies) {
            for (const movie of mockMovies) {
                try {
                    await pool.query(
                        'INSERT INTO movies (movie_id, title, release_date, author, type, poster, backdrop_poster, overview, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);',
                        [
                            movie.movie_id,
                            movie.title,
                            movie.release_date,
                            movie.author,
                            movie.type,
                            movie.poster,
                            movie.backdrop_poster,
                            movie.overview,
                            movie.rating,
                        ]
                    );
                } catch (error) {
                    if (error.code !== '23505') {
                        // if not unique constraint violation
                        throw error;
                    }
                }
            }
        }

        // if(users){

        //     await pool.query(`INSERT INTO users (email, username, password, creation_date) VALUES ($1, $2, crypt($3, gen_salt('bf')), $4);`, 
        //     [mockUser1.email, mockUser1.username, mockUser1.password, mockUser1.creation_date]);

        //     await pool.query(`INSERT INTO addresses (email, country, city, street) VALUES ($1, $2, $3, $4);`,
        //     [mockUser1.email, mockUser1.country, mockUser1.city, mockUser1.street]);

        // }

        // RATINGS MODEL
        if (ratings) {
            // clear ratings table
            await ratingModel.deleteMany({});

            for (const rating of mockRatings) {
                const ratingObj = new ratingModel({
                    email: rating.email,
                    movie_id: rating.movie_id,
                    rating: rating.rating,
                });

                await ratingObj.save();
            }
        }

        logger.info('Test Database built successfully');
        // return pool;
    } catch (error) {
        logger.error(error.stack);
    }
};

const cleanModels = async (): Promise<void> => {
    try {
        await ratingModel.deleteMany({});
    } catch (error) {
        logger.error(error.stack);
    }
};

export const teardownConnections = async (): Promise<void> => {
    try {
        await clearSchema(dbClient);
        await cleanModels();
        await pool.end();
        mongoose.connection.close();
        await dbClient.end();
    } catch (error) {
        logger.error(error.stack);
    }
};

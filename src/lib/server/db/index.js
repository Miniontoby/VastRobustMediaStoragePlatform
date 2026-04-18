import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const client = !env.DATABASE_URL ? null : mysql.createPool(env.DATABASE_URL);

export const db = !client ? null : drizzle(client, { schema, mode: 'default' });


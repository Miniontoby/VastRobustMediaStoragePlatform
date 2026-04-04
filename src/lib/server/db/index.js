import { building } from "$app/environment";
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = !building ? mysql.createPool(env.DATABASE_URL) : null;

export const db = !building ? drizzle(client, { schema, mode: 'default' }) : null;

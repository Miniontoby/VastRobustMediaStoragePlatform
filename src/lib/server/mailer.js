import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: parseInt(env.SMTP_PORT || '587'),
	secure: env.SMTP_PORT === '465', // true for 465, false for others
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASSWORD,
	},
});

const fromName = JSON.stringify(env.SMTP_FROM_NAME || "Default App").slice(1, -1);
const fromEmail = env.SMTP_FROM_EMAIL || env.SMTP_USER || "";

export const defaultFrom = `"${fromName}" <${fromEmail}>`;

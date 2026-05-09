import { betterAuth } from 'better-auth/minimal';
import { admin as adminPlugin } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from './db';
import { ac, uploader, user, admin as adminRole } from './auth-permissions';
import { defaultFrom, transporter } from './mailer';

export const auth = db !== null ? betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'mysql' }),
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			void transporter.sendMail({
				from: defaultFrom,
				to: user.email,
				subject: "Verify your account",
				html: `<p>Click the link to verify your e-mail: <a href="${url}">${url}</a></p>`,
			}).catch(e => console.error('sendVerificationEmail failed', e));
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		async sendResetPassword({ user, url }) {
			void transporter.sendMail({
				from: defaultFrom,
				to: user.email,
				subject: "Password Recovery",
				html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
			}).catch(e => console.error('sendResetPassword failed', e));
		},
	},
	plugins: [
		adminPlugin({
			ac,
			roles: { uploader, user, admin: adminRole },
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
}) : null;

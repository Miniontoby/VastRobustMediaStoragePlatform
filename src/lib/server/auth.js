import { betterAuth } from 'better-auth/minimal';
import { admin as adminPlugin, testUtils } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private'; // playright does not like this
import { getRequestEvent } from '$app/server';
import { db } from './db';
import { ac, uploader, user, admin as adminRole } from './auth-permissions';
import { defaultFrom, transporter } from './mailer';
import { building } from '$app/environment';

export const auth = (db !== null && !building) ? betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [],
	rateLimit: {
		enabled: true,
		window: 10,
		max: 10,
	},
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
        ...(env.NODE_ENV === "test"
            ? [testUtils()]
            : []),
		adminPlugin({
			ac,
			roles: { uploader, user, admin: adminRole },
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
}) : null;

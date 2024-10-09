import { checkCredentials, createGoogleUser } from "@/lib/dynamoDb";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

interface User {
	id: string;
	name?: string;
	email: string;
}

const authOptions: NextAuthOptions = {
	pages: {
		signIn: "/signin",
	},
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			name: "Sign in",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "johndoe@example.com",
				},
				password: {
					label: "Password",
					type: "password",
					placeholder: "PASSWORD",
				},
			},
			async authorize(credentials) {
				try {
					if (credentials?.email && credentials.password) {
						const result = await checkCredentials(
							credentials.email,
							credentials.password
						);

						if (result?.success && result.user) {
							// Ensure result matches User type
							const user: User = {
								id: "",
								name: result.user.name, // Adjust if your user object contains a different field
								email: result.user.email,
							};
							return user;
						} else {
							throw new Error(
								result?.message || "Invalid credentials"
							);
						}
					}
					return null; // Return null if credentials are invalid or no user found
				} catch (error) {
					console.error("Authorization error:", error);
					return null; // Handle errors and return null if needed
				}
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === "google") {
				const email = user.email;
				const name = user.name;
				if (email && name) {
					await createGoogleUser(name, email);
				}
			}
			return true;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
// export { handler as default }
export { handler as GET, handler as POST };

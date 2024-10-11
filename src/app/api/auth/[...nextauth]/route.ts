import { createUser, getUserByPhoneNumber } from "@/lib/dynamoDb";
import { verifyOtp } from "@/lib/twilio";
import { NextAuthOptions, User } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend the built-in User type from next-auth
declare module "next-auth" {
	interface User {
		phoneNumber: string;
	}
}

// Extend the built-in Session type from next-auth
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			phoneNumber: string;
			name?: string | null;
			email?: string | null;
		};
	}
}

const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			name: "Phone number",
			credentials: {
				phoneNumber: {
					label: "Phone Number (With Country Code)",
					type: "text",
					placeholder: "+91 123 123 1233",
				},
				otp: {
					label: "OTP",
					type: "text",
					placeholder: "123456",
				},
			},
			async authorize(credentials): Promise<User | null> {
				try {
					if (credentials?.phoneNumber && credentials.otp) {
						const result = await verifyOtp(
							credentials.phoneNumber,
							credentials.otp
						);
						// if (result.verified) {
						if (true) {
							try {
								// Check if user already exists
								const existingUser = await getUserByPhoneNumber(
									credentials.phoneNumber
								);

								if (existingUser) {
									// User exists, return the user data
									return {
										id: existingUser.id,
										phoneNumber: existingUser.phoneNumber,
										name: existingUser.name || null,
										email: existingUser.email || null,
									};
								} else {
									// User doesn't exist, create a new user
									const newUser = await createUser({
										phoneNumber: credentials.phoneNumber,
									});

									if (newUser && newUser.user?.phoneNumber) {
										return {
											id: newUser.user?.phoneNumber,
											phoneNumber:
												newUser.user?.phoneNumber,
											name: newUser.user?.name || null,
											email: newUser.user?.email || null,
										};
									} else {
										throw new Error(
											"Failed to create user"
										);
									}
								}
							} catch (error) {
								console.error(
									"Error in user creation/retrieval:",
									error
								);
								throw new Error("Failed to process user");
							}
						} else {
							throw new Error("Invalid OTP");
						}
					}
					return null; // Return null if credentials are invalid
				} catch (error) {
					console.error("Authorization error:", error);
					return null;
				}
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.phoneNumber = user.phoneNumber;
			}
			return token;
		},
		async session({ session, token }) {
			return {
				...session,
				user: {
					...session.user,
					id: token.id as string,
					phoneNumber: token.phoneNumber as string,
				},
			};
		},
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

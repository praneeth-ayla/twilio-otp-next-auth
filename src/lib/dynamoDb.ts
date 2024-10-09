import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import * as bcrypt from "bcryptjs";

const dbClient = new DynamoDBClient({
	region: process.env.DYNAMODB_REGION,
	credentials: {
		accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY as string,
	},
});

const TABLE_NAME = process.env.TABLE_NAME as string;
const docClient = DynamoDBDocumentClient.from(dbClient);

const createNewUser = async (name: string, email: string, password: string) => {
	if (!name || !email || !password) {
		return { success: false, message: "All fields are required." };
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	// Check if the email already exists
	const getCommand = new GetCommand({
		TableName: TABLE_NAME,
		Key: {
			email,
		},
	});

	try {
		const userResponse = await docClient.send(getCommand);

		if (userResponse.Item) {
			return { success: false, message: "Email already exists." };
		}

		// Create new user
		const putCommand = new PutCommand({
			TableName: TABLE_NAME,
			Item: {
				email,
				name,
				password: hashedPassword,
			},
			ConditionExpression: "attribute_not_exists(email)",
		});

		await docClient.send(putCommand);
		return { success: true, message: "User created successfully." };
	} catch (error: any) {
		console.error("Error creating new user:", error);
		return {
			success: false,
			message: "An error occurred during user creation.",
		};
	}
};

const createGoogleUser = async (name: string, email: string) => {
	// Check if the email already exists
	const getCommand = new GetCommand({
		TableName: TABLE_NAME,
		Key: {
			email,
		},
	});

	try {
		const userResponse = await docClient.send(getCommand);

		if (userResponse.Item) {
			return { success: false, message: "Email already exists." };
		}

		// Create new user
		const putCommand = new PutCommand({
			TableName: TABLE_NAME,
			Item: {
				email,
				name,
			},
			ConditionExpression: "attribute_not_exists(email)",
		});

		await docClient.send(putCommand);
		return { success: true, message: "User created successfully." };
	} catch (error: any) {
		console.error("Error creating new user:", error);
		return {
			success: false,
			message: "An error occurred during user creation.",
		};
	}
};

const checkCredentials = async (email: string, password: string) => {
	const checkMailCommand = new ScanCommand({
		TableName: TABLE_NAME,
		FilterExpression: "email = :email",
		ExpressionAttributeValues: {
			":email": email,
		},
	});

	try {
		const userResponse = await docClient.send(checkMailCommand);

		if (!userResponse.Items || userResponse.Count === 0) {
			console.log("Invalid email");
			return {
				success: false,
				message: "Invalid email or password.",
				user: null,
			};
		}

		const user = userResponse.Items[0];

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			console.log("Invalid password");
			return { success: false, message: "Invalid password.", user: null };
		}

		// Return user information
		return {
			success: true,
			message: "Login Successfull",
			user: {
				email: user.email,
				name: user.name,
			},
			// Optionally include other user details if needed
		};
	} catch (error) {
		console.error("Error checking credentials:", error);
		return null;
		// return { success: false, message: "An error occurred during authentication." };
	}
};

export { createNewUser, createGoogleUser, checkCredentials };

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({
	region: process.env.DYNAMODB_REGION,
	credentials: {
		accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY as string,
	},
});

const TABLE_NAME = process.env.TABLE_NAME as string;
const docClient = DynamoDBDocumentClient.from(dbClient);

export const createUser = async (userData: {
	phoneNumber: string; // Keep phoneNumber as a string
	name?: string;
	email?: string;
}) => {
	if (!userData.phoneNumber) {
		return {
			success: false,
			message: "Phone number is required.",
		};
	}

	try {
		// Ensure phoneNumber is treated as a string
		const phoneNumber = userData.phoneNumber;

		const putCommand = new PutCommand({
			TableName: TABLE_NAME,
			Item: {
				phoneNumber: phoneNumber, // Store as a string
				name: userData.name || "Default Name",
				email: userData.email || "",
			},
			ConditionExpression: "attribute_not_exists(phoneNumber)", // Prevent overwriting
		});

		const user = await docClient.send(putCommand);
		console.log("PutCommand Result:", user);

		return {
			success: true,
			user: userData, // Return input data as the created user details
			message: "User created successfully.",
		};
	} catch (error: any) {
		console.error("Error creating user:", error);
		if (error.name === "ConditionalCheckFailedException") {
			return {
				success: false,
				message: "User already exists.",
			};
		}
		return {
			success: false,
			message: "An error occurred while creating the user.",
		};
	}
};

export const registerUser = async (userData: {
	phoneNumber: string; // Keep phoneNumber as a string
	name: string;
	email: string;
}) => {
	if (!userData.phoneNumber) {
		return {
			success: false,
			message: "Phone number is required.",
		};
	}

	try {
		const phoneNumber = userData.phoneNumber;

		const updateCommand = new UpdateCommand({
			TableName: TABLE_NAME,
			Key: {
				phoneNumber: phoneNumber, // Use phoneNumber as the key to identify the item
			},
			UpdateExpression: "SET #name = :name, #email = :email",
			ExpressionAttributeNames: {
				"#name": "name",
				"#email": "email",
			},
			ExpressionAttributeValues: {
				":name": userData.name || "Default Name",
				":email": userData.email || "",
			},
			ReturnValues: "ALL_NEW", // Returns the updated item
		});

		const result = await docClient.send(updateCommand);
		console.log("UpdateCommand Result:", result);

		return {
			success: true,
			user: result.Attributes, // Return the updated user details
			message: "User registered successfully.", // Update message for registration
		};
	} catch (error: any) {
		console.error("Error registering user:", error);
		return {
			success: false,
			message: "An error occurred while registering the user.",
		};
	}
};

export async function getUserByPhoneNumber(phoneNumber: string) {
	const getCommand = new GetCommand({
		TableName: TABLE_NAME,
		Key: {
			phoneNumber,
		},
	});

	const response = await docClient.send(getCommand);
	return response.Item; // Return the user item if found
}

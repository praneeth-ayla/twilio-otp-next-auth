import { registerUser } from "@/lib/dynamoDb";

export async function POST(request: Request) {
	const { phoneNumber, name, email } = await request.json();

	try {
		const response = await registerUser({
			phoneNumber,
			email,
			name,
		});

		if (response) {
			return Response.json({ response }, { status: 200 });
		} else {
			return Response.json(
				{ sent: false, message: response },
				{ status: 500 }
			);
		}
	} catch (error: any) {
		return Response.json(
			{
				message: error.message,
			},
			{ status: 500 }
		);
	}
}

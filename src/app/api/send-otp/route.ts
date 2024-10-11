import { sendOtp } from "@/lib/twilio";

export async function POST(request: Request) {
	const { phoneNumber } = await request.json();

	try {
		const response = await sendOtp(phoneNumber);

		if (response.sent) {
			return Response.json({ sent: true }, { status: 200 });
		} else {
			return Response.json(
				{ sent: false, message: response.message },
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

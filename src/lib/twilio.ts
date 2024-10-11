import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID!;

const client = twilio(accountSid, authToken);

async function sendOtp(phoneNumber: string) {
	try {
		const twilioRes = await client.verify.v2
			.services(serviceId)
			.verifications.create({
				to: `+${phoneNumber}`,
				channel: "sms",
			});

		if (twilioRes.status === "pending") {
			return { sent: true };
		} else {
			return { sent: false, message: "Failed to send OTP" };
		}
	} catch (error: any) {
		console.log(error);
		throw new Error(error.message); // Throw the error to handle it in the route
	}
}

async function verifyOtp(phoneNumber: string, otp: string) {
	try {
		const twilioRes = await client.verify.v2
			.services(serviceId)
			.verificationChecks.create({
				to: `+${phoneNumber}`,
				code: otp,
			});

		if (twilioRes.status === "approved") {
			return { verified: true };
		} else {
			return { verified: false, message: "Invalid OTP" };
		}
	} catch (error: any) {
		// console.log(error);
		return { verified: false };
		// throw new Error(error.message); // Throw the error to handle it in the route
	}
}

export { sendOtp, verifyOtp };

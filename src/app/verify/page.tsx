"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OTPPage() {
	const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
	const [otp, setOtp] = useState("");
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [canSendOtp, setCanSendOtp] = useState(true);
	const [timer, setTimer] = useState(30);
	const [isVerifying, setIsVerifying] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		// Start the countdown only if the timer is above 0
		if (!canSendOtp && timer > 0) {
			const countdown = setInterval(() => {
				setTimer((prevTimer) => prevTimer - 1);
			}, 1000);

			// Clear the countdown when the component unmounts or when the timer hits 0
			return () => clearInterval(countdown);
		} else if (timer === 0) {
			setCanSendOtp(true);
			setTimer(30); // Reset the timer for the next attempt
		}
	}, [canSendOtp, timer]);

	const handleSendOtp = async () => {
		if (!phoneNumber) {
			toast({
				title: "Please enter a valid phone number.",
			});
			return;
		}

		setIsSendingOtp(true);

		try {
			const response = await axios.post("/api/send-otp", { phoneNumber });
			console.log(response);

			// Check if the OTP was successfully sent
			if (response.data.sent) {
				toast({
					title: "OTP sent successfully!",
				});
				setCanSendOtp(false); // Disable sending another OTP
			} else {
				toast({
					title: "Failed to send OTP.",
					description: response.data.message,
				});
			}
		} catch (error) {
			console.error("Error sending OTP:", error);
			toast({
				title: "Error sending OTP.",
				description: "Please try again later.",
			});
		} finally {
			setIsSendingOtp(false); // Reset sending state
		}
	};

	async function handleSubmit() {
		if (!otp) {
			toast({
				title: "Please enter the OTP.",
			});
			return;
		}

		setIsVerifying(true);

		try {
			// Sign in using NextAuth's signIn function with the credentials
			const result = await signIn("credentials", {
				redirect: false,
				phoneNumber: phoneNumber,
				otp: otp,
			});

			if (result?.error) {
				toast({
					title: "OTP verification failed.",
					description: result.error,
				});
			} else {
				toast({
					title: "Successfully verified!",
				});
				setTimeout(() => {
					router.push("/");
				}, 1000);
			}
		} catch (error) {
			console.error("Error during sign-in:", error);
			toast({
				title: "Error during verification.",
				description: "Please try again later.",
			});
		} finally {
			setIsVerifying(false);
		}
	}

	return (
		<div className="flex flex-col justify-center items-center h-screen">
			<h1 className="text-2xl mb-4">OTP Verification</h1>
			<div className="mb-4 w-full max-w-xs">
				<Label htmlFor="phoneNumber">Phone Number</Label>
				<PhoneInput
					placeholder="Enter phone number"
					international
					withCountryCallingCode
					defaultCountry="IN"
					value={phoneNumber}
					onChange={(value) => setPhoneNumber(value)}
					className="w-full"
				/>
			</div>
			<div className="mb-4">
				{canSendOtp ? (
					<span
						onClick={handleSendOtp}
						className={`text-blue-500 cursor-pointer ${
							isSendingOtp
								? "text-gray-500 cursor-not-allowed"
								: ""
						}`}>
						{isSendingOtp ? "Sending OTP..." : "Send OTP"}
					</span>
				) : (
					<span className="text-gray-500">
						Resend OTP in {timer} seconds
					</span>
				)}
			</div>
			<div className="mb-4 w-full max-w-xs">
				<Label htmlFor="otp">OTP</Label>
				<Input
					id="otp"
					type="text"
					placeholder="Enter the OTP"
					value={otp}
					onChange={(e) => setOtp(e.target.value)}
				/>
			</div>
			<Button
				onClick={handleSubmit}
				disabled={isVerifying}>
				{isVerifying ? "Verifying..." : "Verify OTP"}
			</Button>
		</div>
	);
}

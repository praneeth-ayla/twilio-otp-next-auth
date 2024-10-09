"use client";
import { signIn } from "next-auth/react";
import { GoogleLoginButton } from "react-social-login-buttons";

export default function GoogleBtn() {
	return (
		<div>
			<GoogleLoginButton
				onClick={async () => {
					await signIn("google", { callbackUrl: "/" });
				}}
			/>
		</div>
	);
}

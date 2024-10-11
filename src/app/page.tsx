"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Page() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return; // Wait for the session to be checked

		if (!session) {
			router.push("/api/auth/signin");
		} else if (!session.user?.name || !session.user?.email) {
			router.push("/registration");
		}
	}, [session, status, router]);

	if (status === "loading" || !session) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading...
			</div>
		);
	}

	if (!session.user?.name || !session.user?.email) {
		return (
			<div className="flex justify-center items-center h-screen">
				Redirecting to complete your profile...
			</div>
		);
	}

	return (
		<div>
			<Navbar />
			<div className="flex flex-col justify-center items-center h-screen">
				<h1 className="text-2xl mb-4">Welcome, {session.user.name}!</h1>
				<p>Email: {session.user.email}</p>
				<p>Phone: {session.user.phoneNumber}</p>
			</div>
		</div>
	);
}

"use client";

import GoogleBtn from "@/components/GoogleBtn";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function Page() {
	const [data, setData] = useState({
		email: "",
		password: "",
	});
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();
	const [error, setError] = useState("");

	useEffect(() => {
		const errorParam = searchParams.get("error");
		if (errorParam) {
			setError("Invalid Credentials");
		}
	}, [searchParams]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);

		try {
			const res = await signIn("credentials", {
				email: data.email,
				password: data.password,
				callbackUrl: "/",
			});

			setLoading(false);
		} catch (error) {
			toast({
				title: "Something went wrong!",
				description: "Please try again later",
			});
			setLoading(false);
		}
	}

	return (
		<div className="flex justify-center items-center h-screen">
			<Card className="p-4">
				<CardTitle>Signup</CardTitle>
				<CardDescription>
					<div className="py-2">
						Don&apos;t have an account?{" "}
						<a
							className="text-blue-400"
							href="/signup">
							Sign up
						</a>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<Label htmlFor="email">Email</Label>
							<Input
								required
								className="text-black"
								id="email"
								name="email"
								type="email"
								placeholder="Enter your email"
								value={data.email}
								onChange={(e) =>
									setData({ ...data, email: e.target.value })
								}
							/>
						</div>

						<div className="mb-4">
							<Label htmlFor="password">Password</Label>
							<Input
								required
								className="text-black"
								id="password"
								name="password"
								type="password"
								placeholder="Enter your password"
								minLength={6}
								value={data.password}
								onChange={(e) =>
									setData({
										...data,
										password: e.target.value,
									})
								}
							/>
						</div>
						<Button
							type="submit"
							disabled={loading}
							variant="default">
							{loading ? <Loader /> : "Submit"}
						</Button>
					</form>
				</CardDescription>
				{error && (
					<CardFooter className="bg-red-300 p-2 text-sm mt-2 rounded-md text-black">
						{error}
					</CardFooter>
				)}
				<div className="flex items-center justify-center my-4">
					<div className="border-t-2 flex-grow" />
					<div className="flex items-center">
						<span className="px-4 text-center">or</span>
					</div>
					<div className="border-t-2 flex-grow" />
				</div>
				<GoogleBtn />
			</Card>
		</div>
	);
}

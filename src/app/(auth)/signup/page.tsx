"use client";
import GoogleBtn from "@/components/GoogleBtn";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
	const [data, setData] = useState({
		name: "",
		email: "",
		password: "",
	});
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);

		try {
			const res = await axios.post("/api/signup", data);
			console.log(res);
			if (res.data.success && res.data.message) {
				toast({
					title: res.data.message,
				});
				setTimeout(() => {
					router.back();
				}, 1000);
			} else {
				toast({
					title: res.data.message,
					description: "Please login",
				});
			}
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
						Already have an account?{" "}
						<a
							className="text-blue-400"
							href="/signin">
							Login
						</a>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<Label htmlFor="name">Name</Label>
							<Input
								required
								className="text-black"
								id="name"
								name="name"
								placeholder="Enter your name"
								value={data.name}
								onChange={(e) =>
									setData({ ...data, name: e.target.value })
								}
							/>
						</div>

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

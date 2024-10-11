"use client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Loader } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
	const { data: session } = useSession();
	const [data, setData] = useState({
		name: "",
		email: "",
		phoneNumber: session?.user.phoneNumber,
	});

	useEffect(() => {
		setData({ ...data, phoneNumber: session?.user.phoneNumber });
	}, [session]);

	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);

		try {
			const res = await axios.post("/api/user/registration", data);
			if (res.data.response.success && res.data.response.message) {
				toast({
					title: res.data.response.message,
					description:
						"You will be logged out shortly to refresh your profile.",
				});

				setTimeout(() => {
					signOut({ callbackUrl: "/" });
				}, 3000);
			} else {
				toast({
					title: res.data.response.message,
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
			<Card className="p-4 flex flex-col gap-6">
				<CardTitle>Complete the registration</CardTitle>
				<CardDescription>
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
						<Button
							type="submit"
							disabled={loading}
							variant="default">
							{loading ? <Loader /> : "Submit"}
						</Button>
					</form>
				</CardDescription>
			</Card>
		</div>
	);
}

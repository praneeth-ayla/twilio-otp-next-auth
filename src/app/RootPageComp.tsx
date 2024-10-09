"use client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RootPageComp() {
	const { data: session } = useSession();
	const isSignIn = session?.user ? false : true;
	const router = useRouter();

	return (
		<div>
			<Navbar />
			<div className="flex flex-col pt-2 items-center h-screen">
				<p>name:{session?.user?.name}</p>
				<p>email:{session?.user?.email}</p>
				<div className="flex justify-center items-center h-2/3 gap-1">
					<Button
						onClick={() => {
							router.push("/signup");
						}}>
						Sing up
					</Button>
					<Button
						onClick={() => {
							signIn();
						}}>
						Sign In
					</Button>
					<Button
						disabled={isSignIn}
						onClick={() => {
							signOut();
						}}>
						Sign out
					</Button>
				</div>
			</div>
		</div>
	);
}

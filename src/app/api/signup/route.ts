import { createNewUser } from "../../../lib/dynamoDb";

export async function POST(request: Request) {
	const body = await request.json();

	const res = await createNewUser(body.name, body.email, body.password);
	// const res = await checkCredentials(body.email, body.password);

	return Response.json(res);
	// return Response.json({ message: "sucess", ress });
}

import {
	Account,
	Client,
	ID,
	Avatars,
	Databases,
	Query,
} from "react-native-appwrite";

export const config = {
	endpoint: "https://cloud.appwrite.io/v1",
	platform: "com.jsm.aora.project",
	projectId: "66d2d4dc002fd742719d",
	databaseId: "66d2d8f600239f4dacf6",
	userCollectionId: "66d2d91a00245875bb50",
	videoCollectionId: "66d2d9390011a5396dbc",
	storageId: "66d2daa8001d1f7bb84d",
};

const {
	endpoint,
	platform,
	projectId,
	databaseId,
	userCollectionId,
	videoCollectionId,
	storageId,
} = config;
// Init your React Native SDK
const client = new Client();

client
	.setEndpoint(config.endpoint) // Your Appwrite Endpoint
	.setProject(config.projectId) // Your project ID
	.setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);

const avatars = new Avatars(client);

const databases = new Databases(client);

// Create a function to create a user / sign up
// All content of the function body has been imported from the documentation

export const createUser = async (email, password, username) => {
	// Register User
	try {
		// Try to create a new account by creating a unique Id, gettint the email, password and username
		const newAccount = await account.create(
			ID.unique(),
			email,
			password,
			username,
		);

		// Checking if no new Account have been created throw an error
		if (!newAccount) throw Error;

		//if a new Account has been created create an avatar with the username initial
		const avatarUrl = avatars.getInitials();

		await signIn(email, password);

		//Create new user in the database

		const newUser = await databases.createDocument(
			config.databaseId,
			config.userCollectionId,
			ID.unique(),
			{
				accountId: newAccount.$id,
				email,
				username,
				avatar: avatarUrl,
			},
		);

		// Return new User

		return newUser;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

// Create function to sign in
export const signIn = async (email, password) => {
	try {
		// Establish a new user session

		const session = await account.createEmailSession(email, password);

		return session;
	} catch (error) {
		throw new Error(error);
	}
};

export const getCurrentUser = async () => {
	try {
		const currentAccount = await account.get();

		if (!currentAccount) throw Error;

		const currentUser = await databases.listDocuments(
			config.databaseId,
			config.userCollectionId,
			[Query.equal("accountId", currentAccount.$id)],
		);

		if (!currentUser) throw Error;

		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
	}
};

// Fetching videos from the database
export const getAllPosts = async () => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

export const getLatestPosts = async () => {
	try {
		const posts = await databases.listDocuments(
			databaseId,
			videoCollectionId,
			Query.orderDesc("$createdAt", Query.limit(7)),
		);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

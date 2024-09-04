import express from "express";               // Importing the Express framework for creating the server
import cookieParser from "cookie-parser";    // Importing the cookie-parser middleware to handle cookies
import cors from "cors";                     // Importing the CORS middleware to allow cross-origin requests
import { generateNonce, SiweMessage } from "siwe"; // Importing methods from the siwe (Sign-In with Ethereum) library

const app = express();                       // Initializing the Express application

app.use(cors({                               // Using the CORS middleware with specific configuration
    origin: "http://localhost:3000"          // Allowing requests only from the specified origin, in this case, which will be localhost:3000 for NextJS development. Replace with your appropriate origin based on your framework (Vite is localhost:5173)
}));
app.use(express.json({ limit: "16kb"}));     // Parsing incoming JSON requests with a limit of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb"})); // Parsing URL-encoded data with a limit of 16kb
app.use(cookieParser());                     // Using the cookie-parser middleware to parse cookies

app.get("/", (req, res) => {                 // Defining a GET route for the root URL
    res.send("Hello World!")                 // Sending a simple "Hello World!" response, this is a test to check if it will work well. Use ThunderCLI for testing
});

let address = "";                            // Variable to store the user's Ethereum address

app.get("/nonce", async (req, res) => {      // Defining a GET route to generate and return a nonce
    const nonce = generateNonce();           // Generating a random nonce using the siwe library
    res.status(200).json({nonce});           // Responding with the nonce in JSON format
});

app.get("/me", (req, res) => {               // Defining a GET route to return the stored Ethereum address
    res.status(200).json({ address });       // Responding with the address in JSON format
});

app.post("/verify", async (req, res) => {    // Defining a POST route to verify the user's Ethereum signature
    const { message, signature } = req.body; // Extracting the message and signature from the request body
    try {
        const siweMessage = new SiweMessage(message); // Creating a new SiweMessage instance with the provided message
        /**
         * Verifies the signature using the siweMessage.verify method.
         *
         * @param {Object} signature - The signature object to be verified.
         * @returns {Promise} - A promise that resolves with the verification result.
         */
        const result = await siweMessage.verify({ signature }); // Verifying the signature using the siweMessage.verify method
        if (result.success) {              // If the verification is successful
            address = result.data.address; // Store the verified Ethereum address
            console.log('Address', address); // Log the verified address to the console, logging helps to check if everything works
        }
        res.status(200).json({ ok: result.success }) // Responding with the verification result
    } catch (error) {                    // Catching any errors that occur during verification
        console.log('Error', error);     // Logging the error to the console
        res.status(500).json({ error: "Verification failed" }); // Responding with an error message
    }
});

app.post("/logout", (req, res) => {       // Defining a POST route for logging out the user
    address = "";                        // Clearing the stored Ethereum address
    res.status(200).json({ ok: true });  // Responding with a success message
});

app.listen(8080, () => {                 // Starting the server on port 8080
    console.log('Server is running on port 8080'); // Logging that the server is running
});

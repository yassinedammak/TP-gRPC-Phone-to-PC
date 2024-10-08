import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import readline from 'readline';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Create __dirname in ES module mode
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the protobuf file
const packageDef = loadSync(`${__dirname}/helloworld.proto`, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const helloWorldPackage = grpcObject.helloworld.HelloWorld; // Access the correct service

// Replace the IP with the actual Ubuntu machine IP
const client = new helloWorldPackage('192.168.233.60:50051', grpc.credentials.createInsecure());

function startStreaming(name, language) {
    console.log(`Starting streaming for ${name} in language: ${language}`);

    // Create the request
    const request = { name: name, language: language };

    // Initiate the server-side streaming
    const call = client.SayHelloStream(request);

    // Handle the streaming responses
    call.on('data', function(response) {
        console.log('Received message:', response.message);
    });

    // Handle the end of the stream (when the server stops streaming)
    call.on('end', function() {
        console.log('Stream ended.');
    });

    // Handle any errors in the stream
    call.on('error', function(e) {
        console.error('Error:', e);
    });

    // Handle status messages from the server
    call.on('status', function(status) {
        console.log('Status:', status);
    });

    // Keep the process alive (daemon-like behavior)
    process.stdin.resume();
}

// Prompt user for name and language
function askUserDetails() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your name: ', (name) => {
        rl.question('Choose your language (en, fr, ar): ', (language) => {
            rl.close();
            startStreaming(name, language);
        });
    });
}

// Start the client by asking for user details
askUserDetails();


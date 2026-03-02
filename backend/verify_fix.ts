import dbConnect from './src/lib/mongodb.js';

async function verify() {
    console.log('Verifying MongoDB connection with the new DNS fix...');
    const success = await dbConnect();
    if (success) {
        console.log('VERIFICATION SUCCESS: Connection established!');
        process.exit(0);
    } else {
        console.error('VERIFICATION FAILURE: Connection failed.');
        process.exit(1);
    }
}

verify();

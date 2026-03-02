import dns from 'dns';
import { promisify } from 'util';

// Set DNS servers to Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const resolveSrv = promisify(dns.resolveSrv);

async function test() {
    console.log('Testing DNS SRV lookup using Google DNS (8.8.8.8)...');
    try {
        const addresses = await resolveSrv('_mongodb._tcp.weeflycab.3simuc.mongodb.net');
        console.log('SRV Records found:', JSON.stringify(addresses, null, 2));
    } catch (err) {
        console.error('SRV Lookup failed with Google DNS:', err);
    }
}

test();

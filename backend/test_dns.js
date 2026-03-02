import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);

async function test() {
    console.log('Testing DNS SRV lookup for _mongodb._tcp.weeflycab.3simuc.mongodb.net...');
    try {
        const addresses = await resolveSrv('_mongodb._tcp.weeflycab.3simuc.mongodb.net');
        console.log('SRV Records found:', JSON.stringify(addresses, null, 2));

        for (const addr of addresses) {
            console.log(`Looking up A/AAAA for ${addr.name}...`);
            try {
                const result = await dns.promises.lookup(addr.name, { all: true });
                console.log(`Results for ${addr.name}:`, result);
            } catch (err) {
                console.error(`Failed to lookup ${addr.name}:`, err.message);
            }
        }
    } catch (err) {
        console.error('SRV Lookup failed:', err);
    }
}

test();

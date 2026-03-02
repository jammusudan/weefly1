import dns from 'dns';

async function test() {
    const hosts = [
        'weeflycab-shard-00-00.3simuc.mongodb.net',
        'weeflycab-shard-00-01.3simuc.mongodb.net',
        'weeflycab-shard-00-02.3simuc.mongodb.net'
    ];

    for (const host of hosts) {
        console.log(`Looking up ${host}...`);
        try {
            const result = await dns.promises.lookup(host, { all: true });
            console.log(`Results for ${host}:`, JSON.stringify(result, null, 2));
        } catch (err) {
            console.error(`Failed to lookup ${host}:`, err.message);
        }
    }
}

test();

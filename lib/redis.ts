import Redis from 'ioredis';

const getClient = () => {
    if (process.env.REDIS_URL) {
        console.log('Redis connecting...');
        return new Redis(process.env.REDIS_URL);
    }
    // Fallback for dev without env (or handling missing key)
    // Warning: this will fail if no URL provided
    return new Redis();
};

// Singleton instance for serverless environments to reuse connection if possible
// though Vercel creates new instances per request often, reusing global acts as optimization
let redis: Redis | null = null;

if (!redis) {
    redis = getClient();
}

export default redis!;

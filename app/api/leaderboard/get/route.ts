import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
    try {
        // Get top 100 users by profit (descending)
        // ioredis returns array [member, score, member, score...]
        // Arguments: key, start, stop, WITHSCORES
        const ranking = await redis.zrange('leaderboard', 0, 99, 'REV', 'WITHSCORES');

        // Get metadata (lastUpdate)
        const metadata = await redis.hgetall('leaderboard:metadata') || {};

        if (!ranking || ranking.length === 0) {
            return NextResponse.json({ leaderboard: [] });
        }

        const leaderboard = [];

        // Iterate with step 2 (member, score)
        for (let i = 0; i < ranking.length; i += 2) {
            const nick = ranking[i];
            const profit = parseFloat(ranking[i + 1]);

            let lastUpdate = new Date().toISOString();
            if (metadata && metadata[nick]) {
                try {
                    const meta = JSON.parse(metadata[nick]);
                    lastUpdate = meta.lastUpdate;
                } catch (e) { }
            }

            leaderboard.push({
                rank: (i / 2) + 1,
                nick: nick,
                totalProfit: profit,
                lastUpdate: lastUpdate
            });
        }

        return NextResponse.json({
            leaderboard,
        });
    } catch (error) {
        console.error('Leaderboard get error:', error);
        return NextResponse.json({
            leaderboard: [],
        });
    }
}

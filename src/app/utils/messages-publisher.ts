import {FastifyInstance} from "fastify";
import {FastifyRedis} from "@fastify/redis";

export const messagesPublisher = async (fastify: FastifyInstance) => {
    const redisClient: FastifyRedis = fastify.redis;
    const stream = 'transactions_stream';

    await redisClient.xadd(stream, '*', 'data', JSON.stringify({
        event: 'health_check',
        user_id: 2
    }));
};

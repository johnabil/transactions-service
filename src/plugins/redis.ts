import fp from 'fastify-plugin';
import {fastifyRedis} from "@fastify/redis";
import {messagesPublisher} from "../app/utils/messages-publisher";

export default fp(async (fastify, opts) => {
    fastify.register(fastifyRedis, {
        url: process.env.REDIS_URL
    });

    fastify.addHook('onReady', async () => {
        messagesPublisher(fastify).catch(fastify.log.error);
    });

    fastify.addHook('onClose', async () => {
        fastify.redis.disconnect();
    });
});

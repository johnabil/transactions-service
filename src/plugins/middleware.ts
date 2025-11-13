import fp from "fastify-plugin";
import {fastifyMiddie} from "@fastify/middie";

export default fp(async (fastify, opts) => {
    await fastify.register(fastifyMiddie, {
        hook: 'onRequest'
    });

    fastify.use(require('cors')());
})

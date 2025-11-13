import fp from "fastify-plugin";
import {fastifyJwt} from "@fastify/jwt";
import {FastifyReply, FastifyRequest} from "fastify";


export default fp(async (fastify, opts) => {
    await fastify.register(fastifyJwt as any, {
        secret: process.env.JWT_SECRET,
    });

    fastify.decorate('authenticate', async (Request: FastifyRequest, Response: FastifyReply) => {
        try {
            await Request.jwtVerify();
        } catch (error) {
            Response.code(401).send({
                message: 'Unauthorized',
            });
        }
    });
})

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }
}

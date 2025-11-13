import {FastifyInstance} from "fastify";
import {AuthenticationController} from "../app/controllers/authentication.controller";

export const UsersRoute = async function (fastify: FastifyInstance, done: any) {
    const authController = new AuthenticationController(fastify);

    fastify.post('/register', authController.register.bind(authController));
    fastify.post('/login', authController.login.bind(authController));
    fastify.post('/logout', {preHandler: [fastify.authenticate]}, authController.logout.bind(authController));
    fastify.get('/me', {preHandler: [fastify.authenticate]}, authController.me.bind(authController));

    done();
}

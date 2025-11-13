import {FastifyInstance} from "fastify";
import {AuthenticationController} from "../app/controllers/authentication.controller";
import {loginSchema, registerSchema, forceAuthHeaderSchema, meSchema} from "../app/utils/user.validation";

export const UsersRoute = async function (fastify: FastifyInstance, done: any) {
    const authController = new AuthenticationController(fastify);

    fastify.post('/register', {
        schema: registerSchema
    }, authController.register.bind(authController));

    fastify.post('/login', {
        schema: loginSchema
    }, authController.login.bind(authController));

    fastify.post('/logout', {
        preHandler: [fastify.authenticate],
        schema: forceAuthHeaderSchema
    }, authController.logout.bind(authController));

    fastify.get('/me', {
        preHandler: [fastify.authenticate],
        schema: meSchema
    }, authController.me.bind(authController));

    done();
}

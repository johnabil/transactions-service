import {FastifyInstance} from 'fastify'
import {UsersRoute} from "./users.route";
import {TransactionsRoute} from "./transactions.route";

const routes = async function (fastify: FastifyInstance) {
    fastify.use(require('cors'));
    fastify.get("/", async () => {
        return {
            'message': "Health check."
        }
    });

    fastify.register(UsersRoute);
    fastify.register(TransactionsRoute, {
        prefix: '/transactions',
        preHandler: fastify.authenticate
    });
}

export default routes

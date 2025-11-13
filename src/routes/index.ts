import {FastifyInstance} from 'fastify'
import {UsersRoute} from "./users.route";

const routes = async function (fastify: FastifyInstance) {
    fastify.use(require('cors'));
    fastify.get("/", async () => {
        return {
            'message': "Health check."
        }
    });

    fastify.register(UsersRoute);
}

export default routes

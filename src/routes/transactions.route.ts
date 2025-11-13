import {FastifyInstance} from "fastify";
import {TransactionsController} from "../app/controllers/transactions.controller";
import {
    storeSchema,
    updateSchema,
    indexSchema,
    allSchema,
} from "../app/utils/transaction.validation";
import {forceAuthHeaderSchema} from "../app/utils/user.validation";

export const TransactionsRoute = async function (fastify: FastifyInstance, done: any) {
    const transactionsController = new TransactionsController(fastify);

    fastify.post('/', {
        schema: storeSchema
    }, transactionsController.store.bind(transactionsController));

    fastify.get('/', {
        schema: allSchema
    }, transactionsController.all.bind(transactionsController));

    fastify.get('/:id', {
        preHandler: [fastify.authenticate],
        schema: indexSchema
    }, transactionsController.index.bind(transactionsController));

    fastify.put('/:id', {
        preHandler: [fastify.authenticate],
        schema: updateSchema
    }, transactionsController.update.bind(transactionsController));

    fastify.delete('/:id', {
        preHandler: [fastify.authenticate],
        schema: forceAuthHeaderSchema
    }, transactionsController.delete.bind(transactionsController));

    done();
}

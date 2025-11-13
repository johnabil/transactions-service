import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {Transaction} from "../models/transactions.model";
import {randomUUID} from "node:crypto";
import {Sequelize} from "sequelize";
import {FastifyRedis} from "@fastify/redis";
import {User} from "../models/user.model";
import {TransactionsRepository} from "../repositories/transactions.repo";

export class TransactionsController {
    private readonly app: FastifyInstance;
    private readonly sequelize: Sequelize;
    private readonly redis: FastifyRedis;
    private readonly transactionsRepo: TransactionsRepository;

    constructor(app: FastifyInstance) {
        this.app = app;
        this.sequelize = this.app.sequelize;
        this.redis = this.app.redis;
        this.transactionsRepo = new TransactionsRepository(this.sequelize);
    }

    async store(Request: FastifyRequest, Response: FastifyReply) {
        const db_transaction = await this.sequelize.transaction();
        const transactionId = randomUUID();

        try {
            const {amount, currency} = Request.body as {
                amount: number;
                currency: string;
            };
            if (!amount || !currency) {
                return Response.status(400).send({message: 'Amount and currency are required'});
            }

            const transaction = await Transaction.create({
                id: transactionId,
                user_id: Request.user.id,
                amount,
                currency,
                status: 'pending',
            }, {
                transaction: db_transaction,
                include: [User]
            });
            await this.redis.xadd('transactions_stream', '*', 'data', JSON.stringify({
                event: 'TransactionCreated',
                transaction: transaction
            }));

            await db_transaction.commit();

            transaction.update({status: 'completed'});

            return Response.status(201).send({
                transaction: transaction,
            });
        } catch (err) {
            await this.redis.xadd('transactions_stream', '*', 'data', JSON.stringify({
                event: 'TransactionDeleted',
                transaction_id: transactionId
            }));
            await db_transaction.rollback();
            return Response.status(500).send({message: 'Something went wrong'});
        }
    }

    async update(Request: FastifyRequest, Response: FastifyReply) {
        const db_transaction = await this.sequelize.transaction();
        const transactionId = Request.id;
        let transaction = await Transaction.findOne({
            where: {id: transactionId},
            include: [User],
            transaction: db_transaction
        });

        try {
            const {amount, currency} = Request.body as {
                amount: number;
                currency: string;
            };
            if (!amount || !currency) {
                return Response.status(400).send({message: 'Amount and currency are required'});
            }
            if (!transaction) {
                return Response.status(404).send({message: 'Transaction not found'});
            }

            transaction.amount = amount;
            transaction.currency = currency;
            await transaction.save();

            await this.redis.xadd('transactions_stream', '*', 'data', JSON.stringify({
                event: 'TransactionUpdated',
                transaction: transaction
            }));

            await db_transaction.commit();

            return Response.status(201).send({
                transaction: transaction,
            });
        } catch (err) {
            await this.redis.xadd('transactions_stream', '*', 'data', JSON.stringify({
                event: 'TransactionUpdated',
                transaction
            }));
            await db_transaction.rollback();
            return Response.status(500).send({message: 'Something went wrong'});
        }
    }

    async delete(Request: FastifyRequest, Response: FastifyReply) {
        const db_transaction = await this.sequelize.transaction();
        const transactionId = Request.id;
        let transaction = await Transaction.findOne({
            where: {id: transactionId},
            include: [User],
            transaction: db_transaction
        });

        try {
            if (!transaction) {
                return Response.status(404).send({message: 'Transaction not found'});
            }
            await transaction.destroy();

            await this.redis.xadd('transactions_stream', '*', 'data', JSON.stringify({
                event: 'TransactionDeleted',
                transaction_id: transactionId
            }));
            await db_transaction.commit();

            return Response.status(201).send({
                message: 'Transaction deleted successfully',
            });
        } catch (err) {
            await this.redis.xadd('transactions_stream', '*', 'data', JSON.stringify({
                event: 'TransactionCreated',
                transaction
            }));
            await db_transaction.rollback();
            return Response.status(500).send({message: 'Something went wrong'});
        }
    }

    async all(Request: FastifyRequest, Response: FastifyReply) {
        const {page = 1, limit = 10, user_id, transaction_id, amount = 0, currency = 'usd'} = Request.query as {
            page?: number;
            limit?: number;
            user_id?: number;
            transaction_id?: string;
            amount?: number;
            currency?: string;
        };
        let totalPages = 0;
        try {
            const offset = (page - 1) * limit;
            const {rows: transactions, count: total} = await this.transactionsRepo.all(user_id, transaction_id,
                amount, currency, offset, limit);

            totalPages = Math.ceil(total / limit);

            return Response.send({
                data: transactions,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            });
        } catch (error: any) {
            console.log(error);
            return Response.send({
                data: [],
                meta: {
                    total: 0,
                    page,
                    limit,
                    totalPages,
                },
            });
        }
    }

    async index(Request: FastifyRequest, Response: FastifyReply) {
        const transactionId = Request.id;
        const transaction = await this.transactionsRepo.findById(transactionId);
        if (!transaction) {
            return Response.status(404).send({message: 'Transaction not found'});
        }
        return Response.send({
            transaction: transaction
        });
    }
}

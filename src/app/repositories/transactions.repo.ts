import {Op, Sequelize} from "sequelize";
import {User} from "../models/user.model";

export class TransactionsRepository {
    public transactions;

    constructor(sequelize: Sequelize) {
        this.transactions = sequelize.models.Transaction;
    }

    async findById(id: string) {
        return await this.transactions.findOne({
            where: {id},
            include: [User]
        });
    }

    async all(user_id: number = 0, transaction_id: string = '', amount: number = 0, currency: string = '', offset: number = 0, limit: number = 10) {
        const filters = [{user_id}, {id: transaction_id}, {amount}, {currency}];

        return await this.transactions.findAndCountAll({
            where: {
                [Op.or]: filters
            },
            include: [User],
            offset,
            limit,
            order: [['created_at', 'DESC']],
        });
    }
}

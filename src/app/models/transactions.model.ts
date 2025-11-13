import type {Sequelize} from "sequelize";
import {DataTypes, Model} from "sequelize";

export class Transaction extends Model {
    declare id: string;
    declare user_id: number;
    declare amount: number;
    declare currency: string;
    declare status: string;
    declare created_at: Date;
    declare updated_at: Date;

    static associate(models: any) {
        Transaction.belongsTo(models.User, {foreignKey: 'user_id'});
    }
}

export const initModel = (sequelize: Sequelize) => {
    Transaction.init({
        iid: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'User',
                key: 'id',
            },
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        tableName: 'transactions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return Transaction;
};

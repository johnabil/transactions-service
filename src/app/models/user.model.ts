import type {Sequelize} from "sequelize";
import {DataTypes, Model} from "sequelize";

export class User extends Model {
    declare id: number;
    declare username: string;
    declare password: string;
    declare created_at: Date;
    declare updated_at: Date;
    declare tokens: Array<string>;

    static associate(models: any) {
        User.hasMany(models.Transaction, {foreignKey: 'user_id'});
    }
}

export const initModel = (sequelize: Sequelize) => {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        tokens: DataTypes.ARRAY,
    }, {
        sequelize,
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return User;
};

import {forceAuthHeaderSchema} from "./user.validation";

const transactionResource = {
    type: 'object',
    properties: {
        transaction: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                amount: {type: 'number'},
                currency: {type: 'string'},
                status: {type: 'string'},
                user: {
                    type: 'object',
                    properties: {
                        token: {type: 'string'},
                        id: {type: 'number'},
                        username: {type: 'string'}
                    }
                }
            }
        }
    }
}

const serverErrorResponse = {type: 'object', properties: {message: {type: 'string'}}}

const storeSchema = {
    headers: forceAuthHeaderSchema.headers,
    body: {
        type: 'object',
        required: ['amount', 'currency'],
        properties: {
            amount: {type: 'number'},
            currency: {type: 'string'},
        },
    },
    response: {
        201: transactionResource,
        500: serverErrorResponse,
    }
}

const updateSchema = {
    headers: forceAuthHeaderSchema.headers,
    body: {
        type: 'object',
        required: ['amount', 'currency'],
        properties: {
            amount: {type: 'number'},
            currency: {type: 'string'},
        },
    },
    response: {
        200: transactionResource,
        500: {type: 'object', properties: {message: {type: 'string'}}}
    }
};

const indexSchema = {
    headers: forceAuthHeaderSchema.headers,
    response: {
        200: transactionResource,
        500: serverErrorResponse,
    }
};

const allSchema = {response: {200: {type: 'array', items: transactionResource}}}

export {storeSchema, updateSchema, indexSchema, allSchema}


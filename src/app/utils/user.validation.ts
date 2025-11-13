const authUserResource = {
    type: 'object',
    properties: {
        message: {type: 'string'},
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
const serverErrorResponse = {type: 'object', properties: {message: {type: 'string'}}}

const loginSchema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: {type: 'string'},
            password: {type: 'string'},
        },
    },
    response: {
        200: authUserResource,
        500: serverErrorResponse,
    }
}

const registerSchema = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: {type: 'string'},
            password: {type: 'string'},
        },
    },
    response: {
        201: authUserResource,
        500: {type: 'object', properties: {message: {type: 'string'}}}
    }
};

const forceAuthHeaderSchema = {
    headers: {
        type: 'object',
        required: ['Authorization'],
        properties: {
            Authorization: {type: 'string'}
        }
    }
};

const meSchema = {
    headers: forceAuthHeaderSchema.headers,
    response: {
        200: {
            type: 'object',
            properties: {
                user: authUserResource.properties.user
            },
        }
    }
};


export {loginSchema, registerSchema, forceAuthHeaderSchema, meSchema}

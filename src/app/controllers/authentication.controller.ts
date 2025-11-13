import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {User} from "../models/user.model";
import bcrypt from "bcryptjs";

export class AuthenticationController {
    private readonly app: FastifyInstance;

    constructor(app: FastifyInstance) {
        this.app = app;
    }

    async register(Request: FastifyRequest, Response: FastifyReply) {
        try {
            const {username, password} = Request.body as {
                username: string;
                password: string;
            };

            if (!username || !password) {
                return Response.status(400).send({message: 'Username and password required'});
            }

            // Check if a user already exists
            const existingUser = await User.findOne({where: {username}});
            if (existingUser) {
                return Response.status(403).send({message: 'Username already exists'});
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            let user = await User.create({username, password: hashedPassword});
            const token = this.app.jwt.sign({id: user.id});
            await user.update({tokens: [token]});

            return Response.status(201).send({
                message: 'User registered successfully',
                user: {
                    token,
                    id: user.id,
                    username: user.username
                },
            });
        } catch (err) {
            return Response.status(500).send({message: 'Something went wrong'});
        }
    }

    async login(Request: FastifyRequest, Response: FastifyReply) {
        try {
            const {username, password} = Request.body as {
                username: string;
                password: string;
            }

            if (!username || !password) {
                return Response.status(400).send({message: 'Username and Password required'});
            }

            const user = await User.findOne({where: {username}});

            if (!user) {
                return Response.status(404).send({message: 'User not found'});
            }

            if (bcrypt.compareSync(password, user.password)) {
                const token = this.app.jwt.sign({id: user.id});
                await user.update({tokens: [...user.tokens, token]});
                return Response.send({
                    message: 'Login successful',
                    user: {
                        token,
                        id: user.id,
                        username: user.username
                    },
                });
            } else {
                return Response.status(401).send({message: 'Wrong username or password'});
            }
        } catch (error: any) {
            console.log(error);
            return Response.code(500).send({
                message: 'Something went wrong',
            });
        }
    };

    async me(Request: FastifyRequest, Response: FastifyReply) {
        if (Request.headers.Authorization === undefined) {
            return Response.status(401).send({
                'message': 'Unauthorized'
            });
        }

        const user_id = Request.user.id || undefined;
        const token = Request.headers.Authorization.toString().replace('Bearer ', '');
        if (user_id) {
            const user = await User.findOne({where: {id: user_id}});
            if (user) {
                if (!user.tokens.includes(token)) {
                    return Response.status(401).send({message: 'Invalid token'});
                }

                return Response.send({
                    user: user
                });
            }
        } else {
            return Response.status(401).send({message: 'Unauthorized'});
        }
    }

    async logout(Request: FastifyRequest, Response: FastifyReply) {
        if (Request.headers.Authorization === undefined) {
            return Response.status(401).send({
                'message': 'Unauthorized'
            });
        }

        const user_id = Request.user.id;
        const token = Request.headers.Authorization.toString().replace('Bearer ', '');
        await User.update({
            tokens: this.app.sequelize.literal(`(SELECT COALESCE(jsonb_agg(value),'[]'::jsonb)
            FROM jsonb_array_elements("tokens") AS value
            WHERE value <> '"${token}"'::jsonb)`)
        }, {where: {id: user_id}});

        return Response.send({message: 'Logout successful'});
    }
}

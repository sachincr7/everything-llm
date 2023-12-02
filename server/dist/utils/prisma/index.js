"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const options = process.env.APP_ENV === 'production'
    ? {}
    : {
        log: [
            {
                emit: 'event',
                level: 'query',
            },
            {
                emit: 'stdout',
                level: 'error',
            },
            {
                emit: 'stdout',
                level: 'info',
            },
            {
                emit: 'stdout',
                level: 'warn',
            },
        ],
    };
const prisma = new client_1.PrismaClient(options);
exports.default = prisma;

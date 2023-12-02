"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const system_1 = require("./endpoints/system");
const admin_1 = require("./endpoints/admin");
const workspaces_1 = require("./endpoints/workspaces");
dotenv_1.default.config();
const app = (0, express_1.default)();
const apiRouter = express_1.default.Router();
const port = process.env.PORT;
const FILE_LIMIT = '3GB';
app.use((0, cors_1.default)({ origin: true }));
app.use(body_parser_1.default.text({ limit: FILE_LIMIT }));
app.use(body_parser_1.default.json({ limit: FILE_LIMIT }));
app.use(body_parser_1.default.urlencoded({
    limit: FILE_LIMIT,
    extended: true,
}));
app.use('/api', apiRouter);
(0, system_1.systemEndpoints)(apiRouter);
(0, admin_1.adminEndpoints)(apiRouter);
(0, workspaces_1.workspaceEndpoints)(apiRouter);
app.all('*', function (_, response) {
    response.sendStatus(404);
});
app
    .listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error(`🎃🎃 UnHandledRejection on ${promise} because ${reason}`, reason);
});

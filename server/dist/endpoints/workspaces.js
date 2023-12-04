"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceEndpoints = void 0;
const validatedRequest_1 = require("../utils/middleware/validatedRequest");
const http_1 = require("../utils/http");
const workspaces_1 = require("../models/workspaces");
const documents_1 = require("../models/documents");
const workspaceEndpoints = (app) => {
    if (!app)
        return;
    app.post('/workspace/new', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            const { name = null, onboardingComplete = false } = (0, http_1.reqBody)(request);
            const { workspace, message } = yield workspaces_1.Workspace.new(name, user === null || user === void 0 ? void 0 : user.id);
            response.status(200).json({ workspace, message });
        }
        catch (error) {
            console.log(error.message, error);
            response.sendStatus(500).end();
        }
    }));
    app.put('/workspace/:slug/update', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!user) {
                response.sendStatus(400).end();
                return;
            }
            const { slug = null } = request.params;
            const data = (0, http_1.reqBody)(request);
            const currentWorkspace = (0, http_1.multiUserMode)(response) ? yield workspaces_1.Workspace.getWithUser(user, { slug }) : yield workspaces_1.Workspace.get({ slug });
            if (!currentWorkspace) {
                response.sendStatus(400).end();
                return;
            }
            const { workspace, message } = yield workspaces_1.Workspace.update(currentWorkspace.id, data);
            response.status(200).json({ workspace, message });
        }
        catch (e) {
            console.log(e.message, e);
            response.sendStatus(500).end();
        }
    }));
    app.get('/workspaces', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!user) {
                response.sendStatus(400).end();
                return;
            }
            const workspaces = (0, http_1.multiUserMode)(response) ? yield workspaces_1.Workspace.whereWithUser(user) : yield workspaces_1.Workspace.where();
            response.status(200).json({ workspaces });
        }
        catch (e) {
            console.log(e.message, e);
            response.sendStatus(500).end();
        }
    }));
    app.get('/workspace/:slug', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { slug } = request.params;
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!user) {
                response.sendStatus(400).end();
                return;
            }
            const workspace = (0, http_1.multiUserMode)(response) ? yield workspaces_1.Workspace.getWithUser(user, { slug }) : yield workspaces_1.Workspace.get({ slug });
            response.status(200).json({ workspace });
        }
        catch (e) {
            console.log(e.message, e);
            response.sendStatus(500).end();
        }
    }));
    app.post('/workspace/:slug/update-embeddings', [validatedRequest_1.validatedRequest], (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield (0, http_1.userFromSession)(request, response);
            if (!user) {
                response.sendStatus(400).end();
                return;
            }
            const { slug = null } = request.params;
            const { adds = [], deletes = [] } = request.body;
            const currWorkspace = (0, http_1.multiUserMode)(response) ? yield workspaces_1.Workspace.getWithUser(user, { slug }) : yield workspaces_1.Workspace.get({ slug });
            if (!currWorkspace) {
                response.sendStatus(400).end();
                return;
            }
            const data = yield documents_1.Document.addDocuments(currWorkspace, adds);
            response.status(200).json({
                data,
            });
        }
        catch (e) {
            console.log(e.message, e);
            response.sendStatus(500).end();
        }
    }));
};
exports.workspaceEndpoints = workspaceEndpoints;

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
exports.updateEmbeddings = void 0;
const http_1 = require("../../utils/http");
const documents_1 = require("../../models/documents");
const workspaces_1 = require("../../models/workspaces");
const updateEmbeddings = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
        const data = yield documents_1.Document.addDocuments(currWorkspace, adds, deletes);
        response.status(200).json({
            data,
        });
    }
    catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
    }
});
exports.updateEmbeddings = updateEmbeddings;

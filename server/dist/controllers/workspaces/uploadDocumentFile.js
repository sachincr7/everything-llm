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
const documentProcessor_1 = require("../../utils/files/documentProcessor");
const uploadDocumentFile = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { originalname } = request.file;
    const processingOnline = yield (0, documentProcessor_1.checkPythonAppAlive)();
    if (!processingOnline) {
        response
            .status(500)
            .json({
            success: false,
            error: `Python processing API is not online. Document ${originalname} will not be processed automatically.`,
        })
            .end();
        return;
    }
});

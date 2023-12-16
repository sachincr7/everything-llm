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
exports.processDocument = exports.checkPythonAppAlive = void 0;
const PYTHON_API = 'http://0.0.0.0:8888';
function checkPythonAppAlive() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${PYTHON_API}`)
            .then((res) => res.ok)
            .catch((e) => false);
    });
}
exports.checkPythonAppAlive = checkPythonAppAlive;
function processDocument(filename = '') {
    return __awaiter(this, void 0, void 0, function* () {
        if (!filename)
            return false;
        return yield fetch(`${PYTHON_API}/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename }),
        })
            .then((res) => {
            if (!res.ok)
                throw new Error('Response could not be completed');
            return res.json();
        })
            .then((res) => res)
            .catch((e) => {
            console.log(e.message);
            return { success: false, reason: e.message };
        });
    });
}
exports.processDocument = processDocument;

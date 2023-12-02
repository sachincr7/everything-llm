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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachedVectorInformation = exports.fileData = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Should take in a folder that is a subfolder of documents
// eg: youtube-subject/video-123.json
function fileData(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!filePath)
            throw new Error('No docPath provided in request');
        const fullPath = process.env.NODE_ENV === 'development'
            ? path_1.default.resolve(__dirname, `../../../storage/documents/${filePath}`)
            : path_1.default.resolve(process.env.STORAGE_DIR, `documents/${filePath}`);
        const fileExists = fs_1.default.existsSync(fullPath);
        if (!fileExists)
            return null;
        const data = fs_1.default.readFileSync(fullPath, 'utf8');
        const parsedData = JSON.parse(data);
        return parsedData;
    });
}
exports.fileData = fileData;
// Searches the vector-cache folder for existing information so we dont have to re-embed a
// document and can instead push directly to vector db.
function cachedVectorInformation(filename, checkOnly = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.CACHE_VECTORS)
            return checkOnly ? false : { exists: false, chunks: [] };
        if (!filename)
            return checkOnly ? false : { exists: false, chunks: [] };
        const digest = (0, uuid_1.v5)(filename, uuid_1.v5.URL);
        const file = process.env.NODE_ENV === 'development'
            ? path_1.default.resolve(__dirname, `../../storage/vector-cache/${digest}.json`)
            : path_1.default.resolve(process.env.STORAGE_DIR, `vector-cache/${digest}.json`);
        const exists = fs_1.default.existsSync(file);
        if (checkOnly)
            return exists;
        if (!exists)
            return { exists, chunks: [] };
        console.log(`Cached vectorized results of ${filename} found! Using cached data to save on embed costs.`);
        const rawData = fs_1.default.readFileSync(file, 'utf8');
        return { exists: true, chunks: JSON.parse(rawData) };
    });
}
exports.cachedVectorInformation = cachedVectorInformation;

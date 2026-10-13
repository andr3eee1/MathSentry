"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedback = exports.hint = exports.inspect = exports.scan = exports.health = void 0;
const mock_json_1 = __importDefault(require("../fixtures/mock.json"));
const health = (_req, res) => res.json({ status: 'ok' });
exports.health = health;
const scan = (_req, res) => res.json(mock_json_1.default.scan);
exports.scan = scan;
const inspect = (_req, res) => res.json(mock_json_1.default.inspect);
exports.inspect = inspect;
const hint = (_req, res) => res.json(mock_json_1.default.hint);
exports.hint = hint;
const feedback = (_req, res) => res.json({ ok: true });
exports.feedback = feedback;

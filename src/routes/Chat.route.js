"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Chat_controller_1 = require("../controllers/Chat.controller");
const router = (0, express_1.Router)();
// Routes quản lý chat
router.post('/sessions', Chat_controller_1.createChatSession); // POST    /api/chat/sessions
router.post('/messages', Chat_controller_1.sendMessage); // POST    /api/chat/messages
router.get('/sessions/:sessionId/messages', Chat_controller_1.getMessagesBySessionId); // GET     /api/chat/sessions/:sessionId/messages
router.patch('/sessions/:sessionId/read', Chat_controller_1.markMessagesAsRead); // PATCH   /api/chat/sessions/:sessionId/read
router.patch('/sessions/:sessionId/close', Chat_controller_1.closeChatSession); // PATCH   /api/chat/sessions/:sessionId/close
router.get('/sessions', Chat_controller_1.getAllChatSessions); // GET     /api/chat/sessions
router.get('/users/:userId/sessions', Chat_controller_1.getUserChatSessions); // GET     /api/chat/users/:userId/sessions
router.patch('/sessions/:sessionId/assign', Chat_controller_1.assignAdminToSession); // PATCH   /api/chat/sessions/:sessionId/assign
exports.default = router;

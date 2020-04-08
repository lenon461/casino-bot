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
var path = require("path");
const botkit_1 = require("botkit");
const { BotkitCMSHelper } = require("botkit-plugin-cms");
const botbuilder_adapter_slack_1 = require("botbuilder-adapter-slack");
const { MongoDbStorage } = require("botbuilder-storage-mongodb");
require("dotenv").config();
let storage;
if (process.env.MONGO_URI) {
    storage = new MongoDbStorage({
        url: process.env.MONGO_URI,
    });
}
const adapter = new botbuilder_adapter_slack_1.SlackAdapter({
    // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
    enable_incomplete: true,
    // parameters used to secure webhook endpoint
    verificationToken: process.env.VERIFICATION_TOKEN,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
    // auth token for a single-team app
    botToken: process.env.BOT_TOKEN,
    // credentials used to set up oauth for multi-team apps
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ["bot"],
    redirectUri: process.env.REDIRECT_URI,
});
// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new botbuilder_adapter_slack_1.SlackEventMiddleware());
// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new botbuilder_adapter_slack_1.SlackMessageTypeMiddleware());
const controller = new botkit_1.Botkit({
    webhook_uri: "/api/messages",
    adapter: adapter,
    storage,
});
if (process.env.CMS_URI) {
    controller.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN,
    }));
}
// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
    // load traditional developer-created local custom feature modules
    // controller.loadModules(path.join(__dirname, "skills"));
    controller.loadModules(path.join(__dirname, "features"));
    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on("message,direct_message", (bot, message) => __awaiter(void 0, void 0, void 0, function* () {
            let results = false;
            results = yield controller.plugins.cms.testTrigger(bot, message);
            if (results !== false) {
                // do not continue middleware!
                return false;
            }
            return false;
        }));
    }
});
controller.webserver.get("/", (req, res) => {
    res.send(`This app is running Botkit ${controller.version}.`);
});
controller.webserver.get("/install", (req, res) => {
    // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    res.redirect(controller.adapter.getInstallLink());
});
controller.webserver.get("/install/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield controller.adapter.validateOauthCode(req.query.code);
        console.log("FULL OAUTH DETAILS", results);
        // // Store token by team in bot state.
        // tokenCache[results.team_id] = results.bot.bot_access_token;
        // // Capture team to bot id
        // userCache[results.team_id] = results.bot.bot_user_id;
        res.json("Success! Bot installed.");
    }
    catch (err) {
        console.error("OAUTH ERROR:", err);
        res.status(401);
        res.send(err.message);
    }
}));
let tokenCache = {};
let userCache = {};
if (process.env.TOKENS) {
    tokenCache = JSON.parse(process.env.TOKENS);
}
if (process.env.USERS) {
    userCache = JSON.parse(process.env.USERS);
}
// async function getTokenForTeam(teamId: any) {
//     if (tokenCache[teamId]) {
//         return new Promise((resolve) => {
//             setTimeout(function() {
//                 resolve(tokenCache[teamId]);
//             }, 150);
//         });
//     } else {
//         console.error("Team not found in tokenCache: ", teamId);
//     }
// }
// async function getBotUserByTeam(teamId: any) {
//     if (userCache[teamId]) {
//         return new Promise((resolve) => {
//             setTimeout(function() {
//                 resolve(userCache[teamId]);
//             }, 150);
//         });
//     } else {
//         console.error("Team not found in userCache: ", teamId);
//     }
// }
// controller.commandHelp = [];
// controller.checkAddMention = function(roomType, command) {
//     var botName = adapter.identity.displayName;
//     if (roomType === "group") {
//         return `\`@${botName} ${command}\``;
//     }
//     return `\`${command}\``;
// };

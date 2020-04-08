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
const botkit_1 = require("botkit");
const Blackjack = require("../../poker/dist/blackjack");
module.exports = function (controller) {
    const convo = new botkit_1.BotkitConversation("blackjack_chat", controller);
    const startAsk = [];
    startAsk.push(`> *Hi, I'm dealer jack*:jack_o_lantern:`);
    startAsk.push(`> *Would you like to play a game or explain about a rule?*`);
    startAsk.push(`> \`play\` \`rule\` \`cancel\`?`);
    convo.ask(startAsk.join("\n"), [
        {
            pattern: "play",
            handler: (_response, convo) => __awaiter(this, void 0, void 0, function* () {
                yield convo.gotoThread("play");
            }),
        },
        {
            pattern: "rule",
            handler: (_response, convo) => __awaiter(this, void 0, void 0, function* () {
                yield convo.gotoThread("rule");
            }),
        },
        {
            pattern: "cancel|stop|exit",
            handler: (_response, convo) => __awaiter(this, void 0, void 0, function* () {
                yield convo.gotoThread("cancel");
            }),
        },
        {
            default: true,
            handler: (_response, convo) => __awaiter(this, void 0, void 0, function* () {
                yield convo.gotoThread("bad_response");
            }),
        },
    ], { key: "playing" });
    // Thread: play
    // const blackjack = new Blackjack.default({ players: 1 });
    // blackjack.start();
    const playAsk = [];
    playAsk.push(`> *Thanks for playing!*:jack_o_lantern:`);
    // playAsk.push(`> ${blackjack.show()}`);
    playAsk.push(`> \`play\` \`rule\` \`cancel\`?`);
    convo.addQuestion("What would you like to drink instead..?", [], "statedDrink", "ask_drink");
    convo.addMessage("Excellent!  I like {{ vars.statedDrink }} too", "ask_drink");
    convo.addMessage({
        text: ["about a rule~~~"],
        action: "complete",
    }, "rule");
    convo.addMessage({
        text: ["Got it...cancelling"],
        action: "complete",
    }, "cancel");
    convo.addMessage({
        text: ['Sorry, I did not understand!\nTip: try "yes", "no", or "cancel"'],
        action: "default",
    }, "bad_response");
    controller.addDialog(convo);
    controller.hears("blackjack", "message,direct_message", (bot, message) => __awaiter(this, void 0, void 0, function* () {
        yield bot.beginDialog("blackjack_chat");
    }));
    // controller.commandHelp.push({ command: "blackjackc", text: "play a blackjack" });
};

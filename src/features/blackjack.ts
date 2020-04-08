import { Botkit, BotkitConversation } from "botkit";
import Blackjack from "../../../poker/src/blackjack";

let blackjack = new Blackjack({ players: 1 });
export default (controller: Botkit) => {
    const convo = new BotkitConversation("blackjack_chat", controller);

    const startAsk = [];
    startAsk.push(`> *Hi, I'm dealer jack*:jack_o_lantern:`);
    startAsk.push(`> *Would you like to play a game or explain about a rule?*`);
    startAsk.push(`> \`play\` \`rule\` \`cancel\`?`);

    convo.ask(
        startAsk.join("\n"),
        [
            {
                pattern: "play",
                handler: async (_response, convo) => {
                    blackjack = new Blackjack({ players: 1 });
                    blackjack.start();

                    await convo.gotoThread("play");
                },
            },
            {
                pattern: "rule",
                handler: async (_response, convo) => {
                    await convo.gotoThread("rule");
                },
            },
            {
                pattern: "cancel|stop|exit",
                handler: async (_response, convo) => {
                    await convo.gotoThread("cancel");
                },
            },
            {
                default: true,
                handler: async (_response, convo) => {
                    await convo.gotoThread("bad_response");
                },
            },
        ],
        { key: "playing" },
    );

    // Thread: play;

    convo.addMessage(
        {
            text: [`> *Thanks for playing!*:jack_o_lantern:`],
            action: "action",
        },
        "play",
    );

    convo.before("action", async (convo, bot) => {
        // set a variable here that can be used in the message template
        convo.setVar("status", `${blackjack.show()}`);
    });
    const ActionAsk = [];
    ActionAsk.push(`> {{vars.status}}`);
    ActionAsk.push(`> \`hit\` \`stand\`?`);

    convo.addQuestion(
        ActionAsk.join("\n"),
        [
            {
                pattern: "hit",
                handler: async (_response, convo) => {
                    blackjack.action("hit");
                    if (blackjack.status == "Hitable") await convo.gotoThread("action");
                    else if (blackjack.status == "Burst") await convo.gotoThread("end");
                    else if (blackjack.status == "BlackJack") {
                        await convo.gotoThread("end");
                    } else {
                        throw new Error("Invalid Status");
                    }
                },
            },
            {
                pattern: "stand",
                handler: async (_response, convo) => {
                    blackjack.action("stand");
                    await convo.gotoThread("end");
                },
            },
            {
                pattern: "cancel|stop|exit",
                handler: async (_response, convo) => {
                    await convo.gotoThread("cancel");
                },
            },
            {
                default: true,
                handler: async (_response, convo) => {
                    await convo.gotoThread("bad_action");
                },
            },
        ],
        "action",
        "action",
    );

    //thread rule
    convo.addMessage(
        {
            text: ["about a rule~~~"],
            action: "complete",
        },
        "rule",
    );

    //thread cancel
    convo.addMessage(
        {
            text: ["Got it...cancelling"],
            action: "complete",
        },
        "cancel",
    );

    //thread bad_response
    convo.addMessage(
        {
            text: ['Sorry, I did not understand!\nTip: try "yes", "no", or "cancel"'],
            action: "default",
        },
        "bad_response",
    );

    //thread bad_action
    convo.addMessage(
        {
            text: ['Sorry, I did not understand!\nTip: try "hit", or "stand"'],
            action: "action",
        },
        "bad_action",
    );

    //thread dealer_turn
    convo.addMessage(
        {
            text: [`> *Nice Stand!*:jack_o_lantern:\n Let's open dealer's card`],
            action: "end",
        },
        "dealer_turn",
    );

    convo.before("end", async (convo, bot) => {
        blackjack.dealer_turn();
        const endMessage = [];
        if (blackjack.status == "Burst") {
            endMessage.push(`You Burst, You Loose`);
        } else if (blackjack.dealer.point > 21) {
            endMessage.push(`Dealer Burst, You Win`);
        } else if (blackjack.status == "BlackJack" && blackjack.dealer.point == 21) {
            endMessage.push(`Dealer & You BlackJack, You Draw`);
        } else {
            if (blackjack.dealer.point > blackjack.players[0].point) {
                endMessage.push(`You Loose`);
            } else if (blackjack.dealer.point == blackjack.players[0].point) {
                endMessage.push(`You Draw`);
            } else if (blackjack.dealer.point < blackjack.players[0].point) {
                endMessage.push(`You Win`);
            }
        }
        convo.setVar("status", `${blackjack.end()}`);
        convo.setVar("endMessage", `${endMessage.join("\n")}`);
    });
    //thread end
    convo.addMessage(
        {
            text: [`> {{vars.status}}\n> {{vars.endMessage}}:`],
            action: "retry",
        },
        "end",
    );

    //thread retry
    convo.addQuestion(
        `> *Want to play more?*:jack_o_lantern:\n \`yes\` \`no\`  `,
        [
            {
                pattern: "again|yes|re|try",
                handler: async (_response, convo) => {
                    blackjack = new Blackjack({ players: 1 });
                    blackjack.start();
                    await convo.gotoThread("play");
                },
            },
            {
                pattern: "cancel|stop|exit|no",
                handler: async (_response, convo) => {
                    await convo.gotoThread("cancel");
                },
            },
            {
                default: true,
                handler: async (_response, convo) => {
                    await convo.gotoThread("bad_response");
                },
            },
        ],
        "retry",
        "retry",
    );

    controller.addDialog(convo);

    controller.hears("blackjack", "message,direct_message", async (bot, message) => {
        await bot.beginDialog("blackjack_chat");
    });

    // controller.commandHelp.push({ command: "blackjackc", text: "play a blackjack" });
};

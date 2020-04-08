module.exports = function(controller) {
    controller.hears(["color"], ["direct_message", "direct_mention"], (bot, message) => {
        console.log(bot);
        console.log(message);

        bot.startConversation(message, (error, convo) => {
            convo.say("This is an example of using convo.ask with a single callback.");
            convo.ask("What is your favorite color?", (response) => {
                convo.say("Cool, I like " + response.text + " too!");
                convo.next();
            });
        });
    });
};

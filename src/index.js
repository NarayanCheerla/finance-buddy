const express = require("express");
const {WebhookClient, Suggestion} = require("dialogflow-fulfillment");

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => res.send("online"));

app.post('/dialogflow', express.json(), (request, response) => {
    const agent = new WebhookClient({request, response});
    
    function welcome() {
        agent.add("Hi, Welcome to ABC mutual fund service. You can ask about ");
        agent.add(new Suggestion("Portfolio valuation"));
        agent.add(new Suggestion("Fund explorer"));
        agent.add(new Suggestion("Transaction history"));
    }
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    agent.handleRequest(intentMap);
});

app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
const express = require("express");
const {WebhookClient} = require("dialogflow-fulfillment");

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => res.send("online"));

app.post('/dialogflow', express.json(), (request, response) => {
    const agent = new WebhookClient({request, response});
    
    function fundExplorerIntent() {
        agent.add("Here are fund categories you can select to view.");
    }

    function fundsListIntent(){
        console.log(JSON.stringify(agent.parameters));
        agent.add(`
        To select ${agent.parameters.category} fund from the below option(s), enter option number

        Enter 1 ABC Overnight Fund
        Enter 2 ABC Liquid Fund
        Enter 3 AbC Saving Fund
        `);
    }

    function fundExplorerFundsListFund(){
        console.log("In fund Explorer FundsListFund intent ",JSON.stringify(agent.parameters));
        if(!agent.parameters.fund){
            agent.add("Please select fund");
            return;
        }
        agent.add(`${agent.parameters.fund}
        The investment objective of the scheme is to provide returns thsclosely correspond the details.
        `);
        agent.add(`
            -Invest
            -Main menu
        `);
    }

    function serviceIntent() {
        console.log(agent.parameters.service);
        if(agent.parameters.service === "Fund Explorer") {
            agent.setFollowupEvent("FundExplorerEvent");
        }else{
            agent.setFollowupEvent("MobileNumberEvent")
        }
        agent.add(`Hi, welcome to service indent from webhook. You have selected ${agent.parameters.service}`);
    }

    function mainMenuIntent(){
        agent.setFollowupEvent("Welcome");
    }

    function investIntent(){
        agent.setFollowupEvent("MobileNumberEvent")
    }

    function mobileNumberIntent(){
        console.log(JSON.stringify(agent.contexts));
        agent.add(`Awesome ${agent.parameters["phone-number"]}`);
    }

    let intentMap = new Map();
    intentMap.set("ServiceIntent", serviceIntent);
    intentMap.set("FundExplorer", fundExplorerIntent);
    intentMap.set("FundExplorer-FundsList",fundsListIntent);
    intentMap.set("FundExplorer-FundsList-Fund", fundExplorerFundsListFund);
    intentMap.set("MainMenuIntent", mainMenuIntent);
    intentMap.set("InvestIntent", investIntent);
    intentMap.set("MobileNumberIntent - custom",mobileNumberIntent);
    agent.handleRequest(intentMap);
});

app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
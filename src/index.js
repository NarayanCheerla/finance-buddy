const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");

const app = express();
const PORT = process.env.PORT || 8080;

const toCurrency = (number, currency, language = undefined) =>
    Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(number);

const mobileNoPattern = /^([+]\d{2})?\d{10}$/;
const transactionsList = `
    Tx     Amount   Status
    01      10000   Success
    02      29400   Failed
    03       8849   Pending
`;

const fundsList = `
    Enter 1 ABC Overnight Fund
    Enter 2 ABC Liquid Fund
    Enter 3 AbC Saving Fund
`;
app.get('/', (req, res) => res.send("online"));

app.post('/dialogflow', express.json(), (request, response) => {
    const agent = new WebhookClient({ request, response });

    function mainMenuIntent() {
        agent.setFollowupEvent("Welcome");
    }

    function serviceIntent() {
        const context = { 'name': 'global', 'lifespan': 10, 'parameters': { 'service': `${agent.parameters.service}` } };
        agent.setContext(context);
        if (agent.parameters.service === "Fund Explorer") {
            agent.setFollowupEvent("FundExplorerEvent");
        } else {
            console.log("coming here ");
            agent.setFollowupEvent("MobileNoEvent")
        }
    }

    function mobileNumberIntent() {
        const mobileNumber = agent.getContext("global").parameters["phone-number"];
        console.log(`Mobile no ${mobileNumber}`);
        if(mobileNumber.match(mobileNoPattern) === null) {
            agent.getContext("global").parameters["phone-number"] = "";
            agent.setFollowupEvent("MobileNoEvent");
        }else {
            if (agent.getContext("global").parameters.service === "Fund Explorer") {
                agent.setFollowupEvent("GoodByeEvent");
            } else if (agent.getContext("global").parameters.service === "Portfolio Valuation") {
                agent.setFollowupEvent("PortfolioValuationEvent");
            } else {
                agent.setFollowupEvent("TransactionHistoryEvent");
            }
        }
    }

    function fundExplorerIntent() {
        agent.add("Here are fund categories you can select to view.");
    }

    function fundsListIntent() {
        agent.add(`
        To select ${agent.parameters.category} fund from the below option(s), enter option number

        ${fundsList}
        `);
    }

    function fundExplorerFundsListFund() {
        if (!agent.parameters.fund) {
            agent.add("Please select fund");
            return;
        }
        agent.add(`${agent.parameters.fund}
        
        The investment objective of the scheme is to provide returns thsclosely correspond the details.

        -Invest
        -Main menu
        `);
    }

    function investIntent() {
        if (!agent.getContext('global').parameters["phone-number"]) {
            agent.setFollowupEvent("MobileNoEvent");
        } else {
            agent.setFollowupEvent("GoodByeEvent");
        }
    }

    function portfolioValuationFolio() {
        console.log(agent.getContext('global').parameters["phone-number"]);
        agent.add(`Your(${agent.getContext('global').parameters["phone-number"]}) folio ${agent.parameters.Folio} valuation ${toCurrency(Math.round(Math.random() * 10000), "INR")} as on ${new Date().toDateString()}`);
    }

    function transactionHistory() {
        if (new Date(agent.parameters.start_date).getTime() > new Date().getTime() ||
            new Date(agent.parameters.end_date).getTime() > new Date().getTime()) {
            agent.setFollowupEvent("TransactionHistorySuggestionsEvent");
        } else {
            agent.add(`Selected Date range ${new Date(agent.parameters.start_date).toDateString()} to ${new Date(agent.parameters.end_date).toDateString()}
            ${transactionsList}
        `);
            agent.add("Do you want to invest more !");
        }
    }

    function transactionsRangeIntent() {
        if (agent.parameters.TransactionsRange === 'Enter Dates') {
            agent.setFollowupEvent("TransactionHistoryEvent");
        } else {
            agent.add(`Selected Date range ${agent.parameters.TransactionsRange}
                ${transactionsList}
            `);
            agent.add("Do you want to invest more !");
        }
    }

    function transactionHistoryYes() {
        agent.setFollowupEvent("FundExplorerEvent");
    }

    function goodByeIntent() {
        agent.add(`Thank you very much for using our services with mobile no ${agent.getContext('global').parameters["phone-number"]}`);
    }

    let intentMap = new Map();
    // Common Intents
    intentMap.set("MainMenuIntent", mainMenuIntent);
    intentMap.set("ServiceIntent", serviceIntent);
    intentMap.set("MobileNoIntent", mobileNumberIntent);

    // Fund Explorer Intents
    intentMap.set("FundExplorer", fundExplorerIntent);
    intentMap.set("FundExplorer-FundsList", fundsListIntent);
    intentMap.set("FundExplorer-FundsList-Fund", fundExplorerFundsListFund);
    intentMap.set("InvestIntent", investIntent);
  
    // Portfolio Valuation Intents
    intentMap.set("PortfolioValuation-Folio", portfolioValuationFolio);

    // Transaction History Intents
    intentMap.set("TransactionHistory", transactionHistory);
    intentMap.set("TransactionsRangeIntent", transactionsRangeIntent);
    intentMap.set("TransactionHistory - yes", transactionHistoryYes);

    // Final Intent
    intentMap.set("GoodByeIntent", goodByeIntent);

    agent.handleRequest(intentMap);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
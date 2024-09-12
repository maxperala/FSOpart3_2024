const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");


app.use(express.static('dist'));
app.use(cors());
app.use(express.json());


morgan.token("body", (req) => req.body ? JSON.stringify(req.body) : null);
const postLog = morgan(":method :url :status :res[content-length] - :response-time ms :body", {
    skip: (req) => req.method !== "POST"
});
const restLog = morgan(":method :url :status :res[content-length] - :response-time ms", {
    skip: (req) => req.method === "POST"
});

app.use(postLog);
app.use(restLog);

let numerot = [
    {
        id: "1",
        name: "Ada Lovelace",
        number: "0400666"
    },
    {
        id: "2",
        name: "Arto Hellas",
        number: 4906833
    }
]

const checkMatch = (id) => {
    const match = numerot.find(nro => nro.id === id);
    return match
}

const checkIntegrity = (contact) => {
    const checkResult = [];
    if (!contact.name) checkResult.push("No name provided");
    if (numerot.find(nro => nro.name === contact.name)) checkResult.push("Name aldready exists");
    if (!contact.number) checkResult.push("No number provided");
    return checkResult;
    
}

const baseURL = "/api";

app.get(`${baseURL}/persons`, (req, res) => {
    res.status(200).json(numerot);
})

app.get(`/info`, (req, res) => {
    const to_send = `Phonebook has info for ${numerot.length} people <br>${new Date()}`
    res.status(200).send(to_send)
})

app.get(`${baseURL}/persons/:id`, (req, res) => {
    const id = req.params.id;
    const match = checkMatch(id);
    if (match) {
        return res.status(200).json(match);
    }
    res.status(404).end();
})

app.delete(`${baseURL}/persons/:id`, (req, res) => {
    const id = req.params.id;
    const match = checkMatch(id);
    if (match) {
        numerot = numerot.filter(nro => nro.id !== id);
        return res.status(200).json(match);
    }
    res.status(404).end();

})

app.post((`${baseURL}/persons`), (req, res) => {
    
    const body = req.body;
    console.log(body)
    if (!body) {
        return res.status(400).json({error: "Request has no content"})
    }
    
    const errors = checkIntegrity(body);

    if (errors.length > 0) {
        return res.status(400).json({error: errors});
    }
    const newContact = {
        id: `${(Math.floor(Math.random() * 12000))}`,
        name: body.name,
        number: body.number
    }
    numerot.push(newContact);
    console.log(newContact);
    res.status(201).json(newContact);
    
})




const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log("Running on port", PORT)
})


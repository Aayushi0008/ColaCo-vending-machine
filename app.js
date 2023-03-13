var express = require('express');
var app = express();
var status_file = require('./status.json')
const path = require('path');

const port = 4001;
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const {writeFile, readFileSync} = require("fs");
const statusFile_path = './status.json'

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
    console.log(`App is listening on port ${port}!`)
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": "*",
    });

    // res.send("Hello World");
    return res.redirect("index.html");
});

app.use('/node_modules',
    express.static(path.join(__dirname, 'node_modules/')));

app.get('/status', function (req, res) {
    res.json(status_file)
});


app.post('/adminUpdate', function (req, res) {
    reloadStatusFile();
    res.send("OK");
});

function reloadStatusFile() {
    status_file = JSON.parse(readFileSync(statusFile_path, {encoding: 'utf8', flag: 'r'}));
}

function writeToFile() {
    writeFile(statusFile_path, JSON.stringify(status_file, null, 2), (err) => {
        if (err) {
            console.log("Failed to write updated data to file");
            return;
        }
        console.log("Updated file successfully");
    });
}

app.post('/update-price', function (req, res) {
    for (let drink in req.body) {
        status_file[drink]["price"] = req.body[drink]["price"]
    }

    writeToFile();
    res.send(status_file);
});

app.post('/add-drink', function (req, res) {
    for (let drink in req.body) {
        status_file[drink] = req.body[drink];
    }

    writeToFile();

    res.send(status_file);
});

app.post('/restock', function (req, res) {
    for (let drink in req.body) {
        status_file[drink]["quantity"] = +status_file[drink]["quantity"] + +req.body[drink]["quantity"];
    }

    writeToFile();

    res.send(status_file);
});

app.post('/purchase', function (req, res) {
    reloadStatusFile();
    if (status_file[req.body.name].quantity <= 0) {
        console.log("Quantity not available");
        res.send({data: -2});
    } else {
        var totalCost = status_file[req.body.name].price * req.body.quantity;
        if (totalCost <= req.body.money) {

            if (status_file[req.body.name].moneyCollected) {
                status_file[req.body.name].moneyCollected += totalCost;
            } else {
                status_file[req.body.name].moneyCollected = totalCost;
            }

            status_file[req.body.name].quantity = status_file[req.body.name].quantity - req.body.quantity;
            writeToFile();
            res.send({data: req.body.money - totalCost});
        } else {
            res.send({data: -1});
        }
    }
});


app.get('/api', (req, res) => {
    if (myCache.has('uniqueKey')) {
        console.log('Retrieved value from cache !!')
        res.send("Result: " + myCache.get('uniqueKey'))
    } else {
        let result = status_file
        myCache.set('uniqueKey', result)
        console.log('Value not present in cache,'
            + ' performing computation')
        res.send("Result: " + result)
    }
})
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

let light = false;

app.use(cors());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { exec } = require("child_process");

app.get('/light', (req, res) => {
    res.send(light);
});

app.get('/light/:state', (req, res) => {
    if (req.params.state == 'true' || req.params.state == 'on') {
        light = true;
        exec("ds4led 255 255 255");//programmino che accende la luce
    } else if (req.params.state == 'false' || req.params.state == 'off'){
        light = false;
        exec("ds4led 0 0 0");
    } else {
        console.log('Error');
    }
    console.log(req.params.state);
    res.send(light);
});

app.get('/luminosity/:value', (req, res) => {
    let lum = req.params.value;
    light ? exec("ds4led " + lum + " " + lum + " " + lum) : console.log('Light is off');
    res.send(light);
});

app.listen(port, () => console.log(`server listening on port ${port}!`));
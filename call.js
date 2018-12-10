const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;
const db = require('./db');
const app = express();
// const config = require('./configurations/config');


app.use(urlencoded({
    extended: false
}));

var userObj;
var userId;

/* Main entry point */
app.post('/voice', (req, res) => {
    const twiml = new VoiceResponse();
    function gatherHarmonyId() {
        const gatherNode = twiml.gather({
            numDigits: 4
        });
        gatherNode.say('Please enter your 4 digit harmony PIN.');
        // Please enter your 4 digit harmony id.
        twiml.redirect('/voice');
    }

    if (req.body.Digits) {
        userId = req.body.Digits;
        const userResp = db.validateUser(userId);

        console.log(userResp);
        if (userResp.status_code == 200) {
            userObj = userResp;
            twiml.say(`Welcome ${userObj.employee_detail.emp_name}`);
            twiml.redirect('/gatherChoice');
        } else {
            twiml.say('Invalid Pin... Trespassers will be Prosecuted');
            gatherHarmonyId();
        }
    } else {
        gatherHarmonyId();
    }
    res.type('text/xml');
    res.send(twiml.toString());
});


app.post('/gatherChoice', function(req, res) {
    const twiml = new VoiceResponse();

    function enterChoice() {
        const gatherNode = twiml.gather({
            numDigits: 1
        });
        gatherNode.say('Press 1 for Leave Management, press 2 for General knowledge module');
        // If the user doesn't enter input, loop
        twiml.redirect('/gatherChoice');
    }

    const choice = req.body.Digits;
    if (choice) {
        switch (choice) {
            case '1':
                twiml.say('Please ask questions related to your leaves!');
                twiml.redirect('/lmsQuestion')
                break;
            case '2':
                twiml.redirect('/gkOptions');
                break;
            default:
                twiml.say("Sorry, I don't understand that choice.");
                twiml.pause({
                    length: 2
                });
                enterChoice();
                break;
        }
    } else {
        enterChoice();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/lmsQuestion', function(req, res) {
    const twiml = new VoiceResponse();

    const gather = twiml.gather({
        input: 'speech',
        action: '/lmsCompleted',
        speechTimeout: 'auto'
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/lmsCompleted', function(req, res) {
    const twiml = new VoiceResponse();
    const speechResult = req.body.SpeechResult;
    console.log(speechResult, req.body.Confidence);
    if (req.body.SpeechResult) {
        console.log(userObj)
        const mlResponse = db.answerQuestion(speechResult, userObj.context, userObj, 1)
        twiml.say(mlResponse.answer);
        // twiml.pause({
        //     length: 2
        // });
        // console.log(mlResponse)
        userObj = db.validateUser(userId);
        console.log(req.body.SpeechResult);
        // twiml.redirect('/lmsDisconnect/'+encodeURI(mlResponse.answer)); //backup option
        twiml.redirect('/lmsDisconnect');
    }

    // twiml.redirect('/goodbye')
    res.type('text/xml');
    res.send(twiml.toString());
});

/* BAckUp Option */
// app.post('/sayLmsAnswer/:answer', function(req, res) {
//     const twiml = new VoiceResponse();
//     const answer = decodeURI(req.params.answer);
//     console.log("Answer lms is " + answer);
//     twiml.say(answer.toString());
//     twiml.redirect('/lmsDisconnect');
//     res.type('text/xml');
//     res.send(twiml.toString());
// })

app.post('/lmsDisconnect', function(req, res) {
    const twiml = new VoiceResponse();

    function enterChoice() {
        const gatherNode = twiml.gather({
            numDigits: 1
        });
        gatherNode.say('Press 1 and ask the next question or press 9 to disconnect the call');
        // If the user doesn't enter input, loop
        twiml.redirect('/lmsDisconnect');
    }

    const choice = req.body.Digits;
    if (choice) {
        switch (choice) {
            case '1':
                twiml.say('Please ask your question!')
                twiml.redirect('/lmsQuestion');
                break;
            case '9':
                twiml.redirect('/goodbye')
                break;
            default:
                twiml.say("Sorry, I don't understand that choice.");
                twiml.pause({
                    length: 2
                });
                gather();
                break;
        }
    } else {
        enterChoice();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/gkOptions', function(req, res) {
    const twiml = new VoiceResponse();

    function gkOptions() {
        const gatherNode = twiml.gather({ numDigits: 1 });
        const str = `Press 1 for Narayana Murthy,
                Press 2 for Bhubaneswar,
                Press 7 to hear again`
        gatherNode.say(str);
        twiml.redirect('/gkOptions')
    }
    const choice = req.body.Digits;
    if (choice) {
        switch (choice) {
            case '1':
            case '2':
                twiml.say('Please ask your question!');
                twiml.redirect('/gkSpeech/' + choice);
                break;
            case '7':
                gkOptions()
                break;
            default:
                twiml.say("Sorry, I don't understand that choice.");
                twiml.pause({
                    length: 2
                });
                gkOptions();
                break;
        }
    } else {
        gkOptions()
    }

    res.type('text/xml');
    res.send(twiml.toString());
});


app.post('/gkSpeech/:categoryId', function(req, res) {
    const twiml = new VoiceResponse();
    // twiml.

    console.log(req.params.categoryId);
    const categoryId = req.params.categoryId;
    const gather = twiml.gather({
        input: 'speech',
        action: '/gkCompleted/' + categoryId,
        speechTimeout: 'auto'
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/gkCompleted/:categoryId', function(req, res) {
    const twiml = new VoiceResponse();
    const categoryId = req.params.categoryId;
    console.log(categoryId)
    const speechResult = req.body.SpeechResult;
    console.log(speechResult, req.body.Confidence);
    // if(speechResult){
    //   twiml.say('Please wait while we search for your answer');
    //   twiml.pause({length:15});
    // }
    if (speechResult) {
        console.log('Test');
        // twiml.say('Please wait while we search for your answer');
        let context;
        if (categoryId == 1) {
            context = 'Narayana Murthy'
        } else {
            context = 'Bhubaneswar'
        }

        let answer = "";

        answer = db.getGkQuestionAnswer(speechResult, context, 2)
        console.log(answer);
        // twiml.say('The answer is ' + answer.toString());
        twiml.redirect('/sayGkAnswer/'+categoryId+'/' + encodeURI(answer));

        // twiml.play({
        //   loop: 1
        // }, 'https://api.twilio.com/cowbell.mp3');

        // const gatherNode = twiml.gather({
        //   numDigits: 1
        // });
        // gatherNode.say('Press 1 and ask the next question or press 9 to disconnect the call');
        // twiml.redirect('/gkDisconnect/' + categoryId);
        // twiml.pause({ length: 2 });
    }

    res.type('text/xml');
    res.send(twiml.toString());
});


app.post('/sayGkAnswer/:categoryId/:answer', function(req, res) {
    const twiml = new VoiceResponse();
    const categoryId = req.params.categoryId;
    const answer = decodeURI(req.params.answer);
    console.log("Answer is " + answer);
    twiml.say('The answer is ' + answer.toString());
    twiml.redirect('/gkDisconnect/' + categoryId);
    res.type('text/xml');
    res.send(twiml.toString());
})

// app.post('/gkIntercept/:categoryId', function(req, res) {
//     const twiml = new VoiceResponse();
//     const categoryId = req.params.categoryId;
//     console.log('Entered')
//     twiml.say('Woke Up');
//     let answer = db.getAnswer(token);
//     // while(answer == ""){
//     //   answer = db.getAnswer(token);
//     //   
//     // }
//     twiml.say(answer);
//     console.log(answer);
//     const gatherNode = twiml.gather({
//         numDigits: 1
//     });
//     gatherNode.say('Press 1 and ask the next question or press 9 to disconnect the call');
//     twiml.redirect('/gkDisconnect/' + categoryId);
// })

app.post('/gkDisconnect/:categoryId', function(req, res) {
    const categoryId = req.params.categoryId;
    const twiml = new VoiceResponse();

    function enterChoice() {
        const gatherNode = twiml.gather({
            numDigits: 1
        });
        gatherNode.say('Press 1 and ask the next question or press 9 to disconnect the call');
        // If the user doesn't enter input, loop
        twiml.redirect('/gkDisconnect/' + categoryId);
    }

    const choice = req.body.Digits;
    if (choice) {
        switch (choice) {
            case '1':
                twiml.say('Please ask your question!')
                twiml.redirect('/gkSpeech/' + categoryId);
                break;
            case '9':
                twiml.redirect('/goodbye')
                    // twiml.say('Welcome to leave management!');
                break;
            default:
                twiml.say("Sorry, I don't understand that choice.");
                twiml.pause({
                    length: 2
                });
                enterChoice();
                break;
        }
    } else {
        enterChoice();
    }

    res.type('text/xml');
    res.send(twiml.toString());
});


app.post('/goodbye', function(req, res) {
    const twiml = new VoiceResponse();
    twiml.say('Goodbye, Have a nice day');
    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
})



app.post('*', function(req, res) {
    const twiml = new VoiceResponse();
    twiml.redirect('/voice');
    res.type('text/xml');
    res.send(twiml.toString());
})

app.get('*', function(req, res) {
    const twiml = new VoiceResponse();
    twiml.redirect('/voice');
    res.type('text/xml');
    res.send(twiml.toString());
})

app.get("/status", function(req, res) {
    res.type('text')
    res.send("Hello I am up and running !")
})

// Create an HTTP server and listen for requests on port 1337
console.log('Twilio Client app HTTP server running at http://127.0.0.1:8008');
app.listen(8008);




// const gatherNode = twiml.gather({ numDigits: 1 });
// gatherNode.say('Press 1 for Leave Management, press 2 for GK questions');
// If the user doesn't enter input, loop
// twiml.redirect('/lms');


// res.writeHead(200, { 'Content-Type': 'text/xml' });
// res.end(twiml.toString());
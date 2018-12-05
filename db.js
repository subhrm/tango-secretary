var Request = require("request");
var request = require('sync-request');
mlUrl = 'http://35.243.243.141:8000/api';
lmsDbUrl = 'http://127.0.0.1:3000';
// lmsDbUrl = 'https://f508ce81.ngrok.io'

/* Working for User Validation Module */
exports.validateUser = function(harmonyId) {
    var response = request('GET', lmsDbUrl + '/validateUser?harmonyId='+harmonyId);
    // console.log(JSON.parse(response.body));
    return (JSON.parse(response.body));
}

/* Working for LMS Module */
exports.answerQuestion = function(question, context, userObj, type=1) {
    let params = { "question": question, "context": context, "type": type, "userObj": userObj };
    var response = request('POST', mlUrl + '/lms_driver', { json: params });
    console.log(params);
    // console.log(response);
    return (JSON.parse(response.body));
    // return 'You have 5 leaves';
}

/* Working for GK Module */
exports.getGkQuestionAnswer = function(question, context, type = 2) {
    let params = { "context": context, "question": question, "type": type };
    var response = request('POST', mlUrl + '/qa', { json: params });
    console.log(params);
    return (JSON.parse(response.body).answer);
}

exports.getGkQuestionToken = function(question, context, type = 2) {
    let params = { "context": context, "question": question, "type": type };
    var response = request('POST', 'http://35.231.2.181:8000/api/post-question', { json: params });
    // console.log(response);
    return (JSON.parse(response.body).request_id);
}
exports.getAnswer = function(token) {
    var response = request('GET', 'http://35.231.2.181:8000/api/get-answer/' + token);
    return (JSON.parse(response.body).answer);
}


exports.getAnswerDirectly = function(question, context, twiml, type = 2) {
    let params = { "context": context, "question": question, "type": type };
    return new Promise(function(resolve, reject) {
        Request.post({
            "headers": { "content-type": "application/json" },
            "url": "http://35.231.2.181:8000/api/qa",
            "body": JSON.stringify(params)
        }, function(error, response, body) {

            if (error) return reject(error);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                twiml.say(JSON.parse(body).answer);
                resolve(JSON.parse(body).answer);
            } catch (e) {
                reject(e);
            }
        });
    });
}

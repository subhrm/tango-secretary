const db = require('./db');

// console.log(db.getGkQuestionAnswer("Who was his wife", "narayana_murthy", 2))

// console.log(db.validateUser(1234))

console.log(db.answerQuestion("How many pending leave request I have?", "The employee id 751224 belongs to Nilesh Sinha . You have a total of  12 leaves left. Your total leave balance is 12. You can avail a total of 12 leaves. You have 12 leaves remaining. Your pending leaves are 12. You can apply for 12 leaves if required. You have submitted 4 requests for approval. You have 4 leave requests pending for approval from your manager. You have applied for 4 leaves already. Your applied leaves are 4. Your manager is Manoj.", {}, 1));


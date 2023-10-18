const Alexa = require("ask-sdk-core");

const randomNumber = (max = 10, min = 1) => {
  return Math.floor(Math.random() * (max - min) + min);
};

class QnA {
  constructor() {
    this.operatorArray = ["+", "-", "+", "-", "+", "+", "-", "+", "-"];
    this.param1 = randomNumber();
    this.param2 = randomNumber(this.param1);
    this.operator = this.operatorArray[randomNumber(9)];
  }

  getQuestion() {
    return `${this.param1} ${this.operator} ${this.param2}`;
  }

  getAnswer() {
    let result;
    switch (this.operator) {
      case "+":
        result = this.param1 + this.param2;
        break;
      case "-":
        if (this.param1 > this.param2) {
          result = this.param1 - this.param2;
        } else {
          result = this.param2 - this.param1;
        }
        break;
    }
    return result;
  }

  generateOptions() {
    const answer = this.getAnswer();
    const options = [answer];

    const verifyOption = () => {
      let ran = randomNumber(100);
      while (options.includes(ran)) {
        ran = randomNumber(100);
      }
      return ran;
    };

    for (let i = 0; i < 3; i++) {
      let option;
      do {
        option = randomNumber(20, 1);
      } while (options.includes(option));
      options.push(option);
    }

    const verifiedOption = verifyOption();

    options.sort(() => Math.random() - 0.5);
    return [verifiedOption, options];
  }
}

let answerr;

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = `Hello! Let's start a math quiz. Are you ready?`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Are you ready to begin the math quiz?")
      .getResponse();
  },
};

const Mathhandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'Mathhandler'
    );
  },
  handle(handlerInput) {
    const newQ = new QnA();
    const question = newQ.getQuestion();
    answerr = newQ.getAnswer();
    const options = newQ.generateOptions();

    const speakOutput = `Here's your math question: ${question}. Your options are ${options[1].join(', ')}.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('Please choose the correct answer.')
      .getResponse();
  },
};

const AnswerIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent'
    );
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const number = slots['answer'].value;
    const userAnswer = parseInt(number, 10);

    let speakOutput;

    if (userAnswer === answerr) {
      speakOutput = 'Correct answer! Great job!';
    } else {
      speakOutput = `Oops! Incorrect answer. The correct answer was ${answerr}.`;
    }

    const newQ = new QnA();
    const question = newQ.getQuestion();
    answerr = newQ.getAnswer();
    const options = newQ.generateOptions();

    const nextQuestionOutput = `Here's your next math question: ${question}. Your options are ${options[1].join(', ')}.`;

    return handlerInput.responseBuilder
      .speak(`${speakOutput} ${nextQuestionOutput}`)
      .reprompt('Please choose the correct answer.')
      .getResponse();
  },
};

const NoHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'NoHandler';
  },
  handle(handlerInput) {
    const speakOutput = 'I am not sure I Understand. Please say Start to start the math quiz and Stop to quit the skill';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Hello?")
      .getResponse();
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent') ||
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'StopIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Thank you for playing. Goodbye!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)  // Add this line to explicitly end the session
      .getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = 'This is a math quiz skill. I will ask you math questions and provide multiple-choice options. You need to choose the correct answer. Are you ready to begin the quiz?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Are you ready to begin the math quiz?")
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    Mathhandler,
    AnswerIntent,
    StopIntent,
    NoHandler,
    HelpIntent
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

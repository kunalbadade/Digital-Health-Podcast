/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const Parser = require('rss-parser');
let parser = new Parser();
const Feed = require('rss-to-json');
const STREAMS = [
  {
    "token": "stream-12",
    "url": 'https://health-podcast-bucket.s3-us-west-1.amazonaws.com/Lil+Nas+X+-+Old+Town+Road+(Official+Movie)+ft.+Billy+Ray+Cyrus.mp3',
    "metadata" : {
      "title": "Stream One",
      "subtitle": "A subtitle for stream one",
      "art": {
        "sources": [
          {
            "contentDescription": "example image",
            "url": "https://s3.amazonaws.com/cdn.dabblelab.com/img/audiostream-starter-512x512.png",
            "widthPixels": 512,
            "heightPixels": 512
          }
        ]
      },
      "backgroundImage": {
        "sources": [
          {
            "contentDescription": "example image",
            "url": "https://s3.amazonaws.com/cdn.dabblelab.com/img/wayfarer-on-beach-1200x800.png",
            "widthPixels": 1200,
            "heightPixels": 800
          }
        ]
      }
    }
  }
];

function loadFeed() {
  return new Promise((resolve, reject) => {
    Feed.load('https://feeds.megaphone.fm/DHT7550289169', function(err, rss){
    if(err)
      reject(err);
    resolve(rss);
  });
    
  });
}

// const LaunchRequestHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
//   },
//   async handle(handlerInput) {
//     console.log('In LaunchRequestHandler')
//    RssFeed = await loadFeed();
//    title = RssFeed.items[0].title 
//    url = RssFeed.items[0].enclosures[0].url

//    console.log('Title '+title)
//    console.log('URL '+url)
    
//     return handlerInput.responseBuilder
//       .speak(title)
//       .reprompt(title)
//       .addAudioPlayerPlayDirective('REPLACE_ALL', url, "Test", 0, null, null)
//       .getResponse();
//   },
// };


const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'LaunchRequest' || 
    handlerInput.requestEnvelope.request.type === 'IntentRequest') &&
        (
          handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOnIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
      );
  },
  async handle(handlerInput) {
    console.log('In PlayStreamIntentHandler')
    RssFeed = await loadFeed();
   title = RssFeed.items[0].title 
   url = RssFeed.items[0].enclosures[0].url

   console.log('Title '+title)
   console.log('URL '+url)
    
    return handlerInput.responseBuilder
      .speak(title)
      .reprompt(title)
      .addAudioPlayerPlayDirective('REPLACE_ALL', url, "Test", 0, null, null)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill plays an audio stream when it is started. It does not have any additional functionality.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is an audio streaming skill that was built with a free template from skill templates dot com';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOffIntent'
        );
  },
  handle(handlerInput) {

    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued' || 
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

//AudioPlayer.PlaybackStarted
const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

//System.ExceptionEncountered
const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

/* HELPER FUNCTIONS */

// async function getPlaybackInfo(handlerInput) {
//   const attributes = await handlerInput.attributesManager.getPersistentAttributes();
//   return attributes.playbackInfo;
// }

// async function canThrowCard(handlerInput) {
//   const {
//     requestEnvelope,
//     attributesManager
//   } = handlerInput;
//   const playbackInfo = await getPlaybackInfo(handlerInput);

//   if (requestEnvelope.request.type === 'IntentRequest' && playbackInfo.playbackIndexChanged) {
//     playbackInfo.playbackIndexChanged = false;
//     return true;
//   }
//   return false;
// }

// const controller = {
//   async play(handlerInput) {
//     const {
//       attributesManager,
//       responseBuilder
//     } = handlerInput;

//     const playbackInfo = await getPlaybackInfo(handlerInput);
//     const {
//       playOrder,
//       offsetInMilliseconds,
//       index
//     } = playbackInfo;
//     console.log('RSS: '+rss)
//     const playBehavior = 'REPLACE_ALL';
//     const podcast = rss[playOrder[index]];
//     const token = playOrder[index];
//     playbackInfo.nextStreamEnqueued = false;

//     responseBuilder
//       .speak(`This is ${podcast.title}`)
//       .withShouldEndSession(true)
//       .addAudioPlayerPlayDirective(playBehavior, podcast.url, token, offsetInMilliseconds, null);

//     if (await canThrowCard(handlerInput)) {
//       const cardTitle = `Playing ${podcast.title}`;
//       const cardContent = `Playing ${podcast.title}`;
//       responseBuilder.withSimpleCard(cardTitle, cardContent);
//     }

//     return responseBuilder.getResponse();
//   },
//   stop(handlerInput) {
//     return handlerInput.responseBuilder
//       .addAudioPlayerStopDirective()
//       .getResponse();
//   },
//   async playNext(handlerInput) {
//     const {
//       playbackInfo,
//       playbackSetting,
//     } = await handlerInput.attributesManager.getPersistentAttributes();

//     const nextIndex = (playbackInfo.index + 1) % constants.audioData.length;

//     if (nextIndex === 0 && !playbackSetting.loop) {
//       return handlerInput.responseBuilder
//         .speak('You have reached the end of the playlist')
//         .addAudioPlayerStopDirective()
//         .getResponse();
//     }

//     playbackInfo.index = nextIndex;
//     playbackInfo.offsetInMilliseconds = 0;
//     playbackInfo.playbackIndexChanged = true;

//     return this.play(handlerInput);
//   },
//   async playPrevious(handlerInput) {
//     const {
//       playbackInfo,
//       playbackSetting,
//     } = await handlerInput.attributesManager.getPersistentAttributes();

//     let previousIndex = playbackInfo.index - 1;

//     if (previousIndex === -1) {
//       if (playbackSetting.loop) {
//         previousIndex += constants.audioData.length;
//       } else {
//         return handlerInput.responseBuilder
//           .speak('You have reached the start of the playlist')
//           .addAudioPlayerStopDirective()
//           .getResponse();
//       }
//     }

//     playbackInfo.index = previousIndex;
//     playbackInfo.offsetInMilliseconds = 0;
//     playbackInfo.playbackIndexChanged = true;

//     return this.play(handlerInput);
//   },
// };

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
//    StartPlaybackHandler,
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler
  )
//  .addRequestInterceptors(LoadPersistentAttributesRequestInterceptor)
//  .addResponseInterceptors(SavePersistentAttributesResponseInterceptor)
//  .withTableName(dynamoDBTableName)
//  .withAutoCreateTable(true)
//  .withDynamoDbClient()
  .lambda();

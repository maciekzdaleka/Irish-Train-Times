/* eslint-disable  func-names */
/* eslint-disable  no-console test */

const Alexa = require('ask-sdk-core');
var parseString = require('xml2js').parseString;
var today = new Date();
const APP_NAME = "Irish Train Times"
const closest_match = require("closest-match");
const all_stations_array = ['Belfast', 'Lisburn', 'Lurgan', 'Portadown', 'Sligo', 'Newry', 'Collooney', 'Ballina', 'Ballymote', 'Dundalk', 'Foxford', 'Boyle', 'Carrick on Shannon', 'Dromod', 'Castlebar', 'Manulla Junction', 'Westport', 'Ballyhaunis', 'Castlerea', 'Longford', 'Claremorris', 'Drogheda', 'Edgeworthstown', 'Laytown', 'Gormanston', 'Roscommon', 'Balbriggan', 'Skerries', 'Mullingar', 'Rush and Lusk', 'Donabate', 'Malahide', 'M3 Parkway', 'Athlone', 'Dunboyne', 'Portmarnock', 'Enfield', 'Kilcock', 'Clongriffin', 'Sutton', 'Bayside', 'Howth Junction', 'Howth', 'Kilbarrack', 'Hansfield', 'Clonsilla', 'Castleknock', 'Raheny', 'Harmonstown', 'Maynooth', 'Navan Road Parkway', 'Coolmine', 'Ashtown', 'Pelletstown', 'Leixlip (Confey)', 'Killester', 'Broombridge', 'Leixlip (Louisa Bridge)', 'Drumcondra', 'Clontarf Road', 'Dublin Connolly', 'Docklands', 'Tara Street', 'Dublin Heuston', 'Dublin Pearse', 'Woodlawn', 'Grand Canal Dock', 'Clara', 'Ballinasloe', 'Adamstown', 'Adamstown', 'Adamstown', 'Lansdowne Road', 'Park West and Cherry Orchard', 'Park West and Cherry Orchard', 'PARK WEST', 'Clondalkin', 'Clondalkin', 'Clondalkin', 'Sandymount', 'Hazelhatch', 'Hazelhatch', 'Hazelhatch', 'Attymon', 'Sydney Parade', 'Booterstown', 'Blackrock', 'Athenry', 'Seapoint', 'Salthill and Monkstown', 'Dun Laoghaire', 'Sandycove', 'Glenageary', 'Dalkey', 'Oranmore', 'Galway', 'Tullamore', 'Killiney', 'Sallins', 'Shankill', 'Craughwell', 'Woodbrook', 'Bray', 'Newbridge', 'Curragh', 'Kildare', 'Ardrahan', 'Portarlington', 'Monasterevin', 'Greystones', 'Kilcoole', 'Gort', 'Portlaoise', 'Athy', 'Wicklow', 'Roscrea', 'Cloughjordan', 'Rathdrum', 'Ballybrophy', 'Nenagh', 'Carlow', 'Ennis', 'Arklow', 'Templemore', 'Birdhill', 'Sixmilebridge', 'Castleconnell', 'Muine Bheag', 'Thurles', 'Gorey', 'Limerick', 'Kilkenny', 'Thomastown', 'Enniscorthy', 'Limerick Junction', 'Tipperary', 'Cahir', 'Clonmel', 'Carrick on Suir', 'Charleville', 'Wexford', 'Campile', 'Ballycullane', 'Rosslare Strand', 'Tralee', 'Wellingtonbridge', 'Waterford', 'Rosslare Europort', 'Bridgetown', 'Farranfore', 'Mallow', 'Banteer', 'Rathmore', 'Millstreet', 'Killarney', 'Midleton', 'Carrigtwohill', 'Glounthaune', 'LittleIsland', 'Cork', 'Fota', 'Carrigaloe', 'Rushbrooke', 'Cobh', 'CITY JUNCTION', 'CENTRAL JUNCTION', 'DUNMURRAY', 'MOIRA'];

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText   = `Hello, you can say; when is the next train from ...`;
    const repromptText = 'Say: when is the next train from...';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetRemoteDataIntent';

  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    var station_name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'irish_stations');
    if (station_name === undefined)
    {
       outputSpeech = 'Cant find the station'; 
    }
    else{
    station_name = closest_match.closestMatch(station_name, all_stations_array);
    await getRemoteData('http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByNameXML?StationDesc=' + station_name)
      .then((response) => {
      
    
       parseString(response, function (err, result) {
        const data  = JSON.stringify(result);
        const data1 = JSON.parse(data);
        var currenTime = today.getHours() + ":" + today.getMinutes();
        var minutes;
        station_name = station_name.charAt(0).toUpperCase() + station_name.slice(1);
        
        
        if(data1.ArrayOfObjStationData.objStationData.length === 0  ){
          outputSpeech = `Sorry, There are currently no trains departuring from ,` + station_name;
        }
        
        
        else if (data1.ArrayOfObjStationData.objStationData.length >= 3  ){
            outputSpeech = `Next three trains from ` + station_name + ',';
            var amorpm = 'am';
            for (let i = 0; i < 3; i++) {
                if (i === 0) {
                //first record
                if (parseInt(data1.ArrayOfObjStationData.objStationData[i].Expdepart) > 12){
                  amorpm = 'pm';
                }
                else{
                  amorpm = 'am';
                
                }
                minutes = parseTime(data1.ArrayOfObjStationData.objStationData[i].Expdepart) - parseTime(currenTime);
                outputSpeech = outputSpeech + 'First train leaves in ' + minutes + ' minutes at ' + data1.ArrayOfObjStationData.objStationData[i].Expdepart + ' ' + amorpm + 
                ' direction ' + data1.ArrayOfObjStationData.objStationData[i].Destination + ', '
              } 
              else if (i === 1) {
                if (parseInt(data1.ArrayOfObjStationData.objStationData[i].Expdepart) > 12){
                amorpm = 'pm';
                }
                else{
                amorpm = 'am';
                }
                minutes = parseTime(data1.ArrayOfObjStationData.objStationData[i].Expdepart) - parseTime(currenTime);
                outputSpeech = outputSpeech + 'Second train leaves in ' + minutes + ' minutes at ' + data1.ArrayOfObjStationData.objStationData[i].Expdepart + ' ' + amorpm + 
                ' direction '+ data1.ArrayOfObjStationData.objStationData[i].Destination + ', '
              }
              else if (i === 2) {
                //last record
                if (parseInt(data1.ArrayOfObjStationData.objStationData[i].Expdepart) > 12){
                  amorpm = 'pm';
                }
                else{
                  amorpm = 'am';
                }
                minutes = parseTime(data1.ArrayOfObjStationData.objStationData[i].Expdepart) - parseTime(currenTime);
                outputSpeech = outputSpeech + 'and third train leaves in ' + minutes + ' minutes at ' + data1.ArrayOfObjStationData.objStationData[i].Expdepart + ' ' + amorpm + 
                ' direction '+ data1.ArrayOfObjStationData.objStationData[i].Destination
              } else {
              // middle record(s)
              outputSpeech = outputSpeech =  'No Data,'
              }  
        }
      }
      else if (data1.ArrayOfObjStationData.objStationData.length < 3  ){
        var train_amount = parseInt(data1.ArrayOfObjStationData.objStationData.length);
        if(train_amount > 1){
          outputSpeech = `\\\\Next ${data1.ArrayOfObjStationData.objStationData.length} trains from ` + station_name + ',';
        }
        else
        {
          outputSpeech = `Warning, Last train,`;
        }
        amorpm = 'am';
        for (let i = 0; i < data1.ArrayOfObjStationData.objStationData.length; i++) {
            if (i === 0 && train_amount > 1) {
            //first record
            if (parseInt(data1.ArrayOfObjStationData.objStationData[i].Expdepart) > 12){
              amorpm = 'pm';
            }
            else{
              amorpm = 'am';
            }
            minutes = parseTime(data1.ArrayOfObjStationData.objStationData[i].Expdepart) - parseTime(currenTime);
            outputSpeech = outputSpeech + 'First train leaves in ' + minutes + ' minutes at ' + data1.ArrayOfObjStationData.objStationData[i].Expdepart + ' ' + amorpm 
            ' direction '+ data1.ArrayOfObjStationData.objStationData[i].Destination + ', '
          } 
          else if (i === train_amount ) {
            if (parseInt(data1.ArrayOfObjStationData.objStationData[i].Expdepart) > 12){
            amorpm = 'pm';
            }
            else{
            amorpm = 'am';
            }
            minutes = parseTime(data1.ArrayOfObjStationData.objStationData[i].Expdepart) - parseTime(currenTime);
            outputSpeech = outputSpeech + 'Last train leaves '+ station_name + ' in ' + minutes + ' minutes at ' + data1.ArrayOfObjStationData.objStationData[i].Expdepart + ' ' + amorpm +
            ' direction '+ data1.ArrayOfObjStationData.objStationData[i].Destination 
          }
          else {
          // middle record(s)
            minutes = parseTime(data1.ArrayOfObjStationData.objStationData[i].Expdepart) - parseTime(currenTime);
            outputSpeech = outputSpeech + 'next train leaves in ' + minutes + ' minutes at ' + data1.ArrayOfObjStationData.objStationData[i].Expdepart + ' ' + amorpm +
            ' direction '+ data1.ArrayOfObjStationData.objStationData[i].Destination + ', '
          }  
    }
  }
        });
      })
      .catch((err) => {
        outputSpeech = 'Error' + err;
        //set an optional error message here
        outputSpeech = err.message;
      });
    }
      
      
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();

  },
};

function parseTime(s) {
  var splitstring = s + '';
  var c = splitstring.split(':');
  return parseInt(c[0]) * 60 + parseInt(c[1]);
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  })
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();


const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {

//Node.js 16.x
//HubSpot Client v3
//Property to include in code: hs_object_id = ticket record ID
//Created on 6/28/2023 by Anthony Narsi
//Inspired by and code stolen from Nathan De Long

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken
  });
  
  try{
  //get the id of the contact object associated with the ticket
  
  const hs_object_id = event.inputFields['hs_object_id'];
  //first, reach out to the associations API to get the contact associated with the ticket. 
  const apiResponse = await hubspotClient
              .apiRequest({
              method: 'GET',
              path: `/crm/v4/objects/ticket/${hs_object_id}/associations/contacts`,
              body: {}
            });
  //show the contact object associated with the ticket in the console
  console.log(JSON.stringify(apiResponse.body, null, 2));
  //put the ID for the associated contact object into a variable
  const thisContact = apiResponse.body.results.map(resultItem => resultItem.toObjectId);
  //log to the console for debugging
  console.log(`The contact ID is: ${thisContact}`);
    
  //now, get the deal id associated with the contact object
  const apiResponse2 = await hubspotClient
              .apiRequest({
              method: 'GET',
              path: `/crm/v4/objects/contacts/${thisContact}/associations/deals`,
              body: {}
            });
  //show the ticket associated with the contact in the console
  console.log(JSON.stringify(apiResponse2.body, null, 2));
  //put the ID for the ticket associated with the contact into a variable
  const contact = apiResponse2.body.results.map(resultItem => resultItem.toObjectId);
  //log to the console for debugging
  console.log(`The contact ID is: ${contact}`);
  const contactStr = contact.toString();
  console.log(contactStr);
  
  //now, associate the deal to the ticket
  const BatchInputPublicAssociation = { inputs: [{"from":{"id":contactStr},"to":{"id":hs_object_id},"type":"deal_to_ticket"}] };
  const fromObjectType = "deal";
  const toObjectType = "ticket";

  const apiResponse4 = await hubspotClient.crm.associations.batchApi.create(fromObjectType, toObjectType, BatchInputPublicAssociation);
  console.log(JSON.stringify(apiResponse4, null, 2));
    
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
  }

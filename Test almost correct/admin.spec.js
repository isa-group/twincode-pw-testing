const session = "simulacro2022";

/////////////////////
require('dotenv').config();

var h = require('../helpers')
h.setPrefix("ADMIN");

const admin_secret = process.env.ADMIN_SECRET;
const twincodeBack = process.env.TWINCODE_BACK;

if (!admin_secret){
    h.log("I need env var ADMIN_SECRET configured!");
    process.exit(1);
}
 
if (!twincodeBack){
    h.log("I need env var TWINCODE_BACK configured!");
    process.exit(1);
}

const { expect, test, chromium} = require('@playwright/test');
const request = require('sync-request');

test('ADMIN simulation test', async ({  }) => {

    try{

        h.log("Start");

        h.log("Reseting the session...");
        try{
            var res = request('POST', twincodeBack+'/resetSession', {
                json: {'session': session},
                headers: {
                    'Authorization': admin_secret,
                }
            });
        }catch(e){
            h.log("ERROR resetting the session - "+e);
            process.exit(1);
        }
        
        var response = JSON.parse(res.getBody('utf8'));
        
        if(!response.n || response.n == 0){
            h.log("ERROR - Session not found! ");
            process.exit(1);
        }else{
            if(response.nModified == 0){
                h.log("Session <"+session+"> was already reset.");
            }else{
                h.log("Session <"+session+"> reset completed.");
            }
        }

        h.log("Waiting for participants to be ready in lobby");
        await h.delay(10);

        h.log("Starting the session...");
        res = request('POST', twincodeBack+'/startSession/'+session, {
            headers: {
                'Authorization': admin_secret,
            }
        });
        
        response = JSON.parse(res.getBody('utf8'));
        
        if(response.msg != "Session started"){
            h.log("ERROR - Problem starting the session <"+session+">",response);
            process.exit(1);
        }else{
            h.log("Session <"+session+"> started.");
        }

        h.log("Finish.");

    }catch(e){
        console.error(e);
    }
      
});
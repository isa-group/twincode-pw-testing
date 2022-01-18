/* Test parameters **********/

const code = 815248;
const token = "melon";

/////////////////////////

/* Initialize test configuration **********/

require('dotenv').config();

var h = require('../helpers')
const room = "___"
h.setPrefix(code);
h.setPath(__dirname);

const twincodeFront = process.env.TWINCODE_FRONT;

if (!twincodeFront){
    h.log("I need env var TWINCODE_FRONT configured!");
    process.exit(1);
}

const { expect, test, chromium} = require('@playwright/test');
const fs = require('fs');

/* Custom Test Helper Functions **********/

async function chitchat(pfx,chatBox,page,room){

    h.log("Saying hi...");
    await chatBox.type(pfx+"Hi I'm "+code+" at room "+ room);
    await chatBox.type(String.fromCharCode(13));
    h.log("Waiting for partner to chat...");
    await h.delay(2);
    h.sc(page);

    const mmsgs = await page.$$(".myMsgText");
    const mmCount = await mmsgs.length;
    
    h.log(`My messages (${mmCount}): `);
    for(var i =0; i < mmCount ; i++){
        const mm = await mmsgs[i].innerText();
        h.log(`   <${mm}>`);
    }

    const pmsgs = await page.$$(".partnerMsgText");
    const pmCount = await pmsgs.length;

    h.log(`Partners messages (${pmCount}): `);
    for(var i =0; i < pmCount ; i++){
        const pm = await pmsgs[i].innerText();
        h.log(`   <${pm}>`);
    }

    const imgs = await page.$$(".msgAvatar");
    const imCount = await imgs.length;
    var avatar = null;

    if(imCount > 1){
        h.log(`Visible Avatars (${imCount}): `);
        for(var i =0; i < imCount ; i++){
            const im = await imgs[i].getAttribute("src");
            avatar = im;
            h.log(`   <${im}>`);
        }    
    }else if(imCount == 1){
        const im = await imgs[0].getAttribute("src");
        avatar = im;
        h.log(`Visible Avatar: <${im}>`);
    }else if(imCount == 0){
        h.log(`Visible Avatar: NONE`);
    }else if(imCount < 0){
        h.log(`ERROR: imCount < 0`);
        process.exit(1);
    }

    return {
        pmCount,
        mmCount,
        imCount,
        avatar
    };
}

function gender(avatar){
    if (avatar.includes("girl"))
        return "F";
    else if (avatar.includes("boy"))
        return "M";
    else
        return null;
    
}


/* Main test logic **********/

test('User simulation test', async ({  }) => {

    try{

        h.log("Start");
        await h.delay(2);

        test.setTimeout(180 * 1000); // 180 Secs

        const browser = await chromium.launch();
        const context = await browser.newContext({
        recordVideo: {
           dir: __dirname+"/recordings"
        }
        });
        const page = await context.newPage();
        const url = twincodeFront+"?code="+code;

        await h.delay(2);
        h.log(`Accesing <${url}>`);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        h.sc(page); // 1
        await h.delay(2);

        h.log(`Introducing token <${token}>`);
        const element = page.locator("#tokenInput");
        await element.type(token);
        h.sc(page); //2
        await h.delay(2);
        await element.press('Enter');
        h.log(`WAITING for session to start!`);
        await h.delay(1);
        h.sc(page); //3
        await h.delay(10);
        h.sc(page); //4

        const currentURL=await page.url();

        h.log(`Current URL: <${currentURL}>`);
        const room = currentURL.slice(-3);
        h.log(`Room: <${currentURL}>`);

        var chatBox = page.locator("#chatbox");

        expect(chatBox).toBeDefined();

        await h.delay(8);
        const ccResult1 = await chitchat("(1) ",chatBox,page,room); //5

        h.log("Checking message number...");
        expect(ccResult1.pmCount).toEqual(1);
        expect(ccResult1.mmCount).toEqual(1);

        h.log("Waiting for individual part...");
        await h.delay(32);
        h.sc(page); //6

        h.log("Checking chatbox is disabled...");
        const chatbox = await page.$$("#chatbox");
        await expect(chatbox[0]).toBeDefined();

        const disAttr = await chatbox[0].getAttribute("disabled");
        //await expect(disAttr).toBe("disabled");

        await h.delay(10);
        h.sc(page); //7
        
        h.log("Waiting for second Paired part...");
        await h.delay(30);
        h.sc(page); //8

        await h.delay(20);
        chatBox = page.locator("#chatbox");

        expect(chatBox).toBeDefined();

        const ccResult2 = await chitchat("(2) ",chatBox,page,room); //9

        h.log("Checking message number...");
        /*
        expect(ccResult2.pmCount).toEqual(1);
        expect(ccResult2.mmCount).toEqual(1);

        if(ccResult1.avatar){
            expect(ccResult1.avatar).toBeDefined();
            expect(ccResult2.avatar).toBeDefined();
            expect(gender(ccResult1.avatar)).not.toBe(gender(ccResult2.avatar));
        }else{
            expect(ccResult2.avatar).toBeNull();
        }
        */

        h.log("Finishing test...");
        await h.delay(20);
        h.sc(page); //10

        const initialVideoPath = await page.video().path();
      
        await browser.close();
      
        h.log(`Test recorded on <...${initialVideoPath.slice(-60)}>`);
      
        fs.stat(initialVideoPath, (err, stats) => {
          if ( err ) console.log('ERROR: ' + err);
          expect(err).toBeNull();
          expect(stats.size).toBeGreaterThan(0);
        });

        const videoPath = __dirname+"/recordings/"+room+"_"+code+".webm";
        
        fs.rename( initialVideoPath, videoPath, function(err) {
            if ( err ) console.log('ERROR: ' + err);
            expect(err).toBeNull();
            h.log(`Recording available at <...${videoPath.slice(-60)}>`);
        });

        h.log("Finish.");

    }catch(e){
        console.error(e);
    }
      
});
const fs = require('fs');
const mustache = require('mustache');

const atFile = "./templates/admin";
const utFile = "./templates/user";
const rootTestFolder = "./tests" 

var session = "simulacro2022";
var codes = [104599,815248,543651]//[104599,815248,543651,375119,353986,149730,947683,368625,989569,121315,630536,787692,966249,983311,390404];
var token = "melon";

const testFolder = rootTestFolder+"/"+session;

if (!fs.existsSync(testFolder)){
    fs.mkdirSync(testFolder);
}else{
    console.error(`Output test directory <${testFolder}> already exists.`);
    process.exit(1);
}

var adminTemplate = null;
try {
  adminTemplate = fs.readFileSync(atFile, 'utf8')
} catch (err) {
  console.error(`Error reading admin template <${atFile}>:`+err);
  process.exit(1);
}

var userTemplate = null;
try {
  userTemplate = fs.readFileSync(utFile, 'utf8')
} catch (err) {
  console.error(`Error reading user template <${utFile}>:`+err);
  process.exit(1);
}

const adminTestFile = testFolder+"/admin.spec.js";
const adminTest = mustache.render(adminTemplate, {session});

try {
    fs.writeFileSync(adminTestFile, adminTest)
} catch (err) {
    console.error(`Error writing admin test <${adminTestFile}>:`+err);
    process.exit(1);
}

codes.forEach( (code) =>{

    const userTestFile = testFolder+"/"+code+".spec.js";
    const userTest = mustache.render(userTemplate, {code,token});
    
    try {
        fs.writeFileSync(userTestFile, userTest)
    } catch (err) {
        console.error(`Error writing user test <${userTestFile}>:`+err);
        process.exit(1);
    }
});

console.log(`Test with ${codes.length} users for session <${session}> generated at:\n  <${testFolder}>`);
console.log("\nRun it with the following command:");
console.log(`npx playwright test ${testFolder}`);


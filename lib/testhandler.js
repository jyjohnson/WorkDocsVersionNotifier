//import your handler file or main file of Lambda
let handler = require('./lambda-parse-xml');

//Call your exports function with required params
//In AWS lambda these are event, content, and callback
//event and content are JSON object and callback is a function
//In my example i'm using empty JSON
handler.handler( 
    {}, //event
    {}, //content
    function(data) {  //callback function with two arguments 
        console.log(data);
    });
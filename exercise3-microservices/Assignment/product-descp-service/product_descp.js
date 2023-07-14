module.exports = function (options) {
    //Import the mock data json file
    const mockData = require('./MOCK_DATA.json');

    //Add the patterns and their corresponding functions
    this.add('role:product,cmd:getProductURL', getProductURL);
    this.add('role:product,cmd:getProductName', getProductName);


    //To DO: add the pattern functions and describe the logic inside the function

    function getProductURL(msg, respond) {
        var res = mockData[0].productURL;
        respond(null, { result: res });
    }


    function getProductName(msg, respond) {

        if (!msg.productId) {
            return respond(new Error('product id is missing'));
        }

        var id = Number(msg.productId);
        var res = mockData[id].productName;
        respond(null, { result: res });

    }
}
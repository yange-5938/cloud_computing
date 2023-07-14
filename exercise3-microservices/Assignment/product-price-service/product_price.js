module.exports = function (options) {
    //Import the mock data json file
    const mockData = require('./MOCK_DATA.json');
    //To DO: Add the patterns and their corresponding functions

    this.add('role:product,cmd:getProductPrice', getProductPrice);
    this.add('role:product,cmd:getProductPriceName', getProductPriceName);
    this.add('role:product,cmd:getProductPriceURL', getProductPriceURL);

    //To DO: add the pattern functions and describe the logic inside the function
    function getProductPrice(msg, respond) {
        if (!msg.productId) {
            return respond(new Error('product id is missing'));
        }

        var id = Number(msg.productId);
        var res = mockData[id].product_price;
        respond(null, { result: res });
        
    }

    function getProductPriceName(msg, respond) {
        if (!msg.productId) {
            return respond(new Error('product id is missing'));
        }

        var id = Number(msg.productId);
        var res = mockData[id].product_name;
        respond(null, { result: res });
        
    }

    function getProductPriceURL(msg, respond) {
        if (!msg.productId) {
            return respond(new Error('product id is missing'));
        }

        var id = Number(msg.productId);
        var res = mockData[id].product_url;
        respond(null, { result: res });
        
    }

}
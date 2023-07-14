/**
 * import the seneca package
 */
const seneca = require('seneca')();
const Promise = require('bluebird');
const config = require('../config');
const { get } = require('../app');
/**
 * Convert act to Promise
 */
const act = Promise.promisify(seneca.client({ host: config.product_price_service.host, port: config.product_price_service.port }).act, { context: seneca });

/**
 * To DO: Define Service Method
 */
const GET_PRODUCT_PRICE = { role: 'product', cmd: 'getProductPrice' };
const GET_PRODUCT_PRICE_NAME= { role: 'product', cmd: 'getProductPriceName' };
const GET_PRODUCT_PRICE_URL= { role: 'product', cmd: 'getProductPriceURL' };


/**
 * To DO: Call Service Method
 */
const getProductPrice = function(productId){
    /**
     * To DO: Write act Method
     */
    return act(Object.assign({}, GET_PRODUCT_PRICE, { productId }));


};

const getProductPriceNAME = function(productId){
    /**
     * To DO: Write act Method
     */
    return act(Object.assign({}, GET_PRODUCT_PRICE_NAME, { productId }));


};

const getProductPriceURL = function(productId){
    return act(Object.assign({}, GET_PRODUCT_PRICE_URL, { productId }));
};


module.exports = {
    getProductPrice,
    getProductPriceNAME,
    getProductPriceURL
};

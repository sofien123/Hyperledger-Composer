/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * create an order to purchase
 * @param {org.acme.sintegralabsbc.CreateOrder} purchase - the order to be processed
 * @transaction
 */
function CreateOrder(purchase) {
    purchase.order.buyer = purchase.buyer;
    purchase.order.seller= purchase.seller;
    purchase.order.amount = purchase.amount;
    purchase.order.createdDate = new Date().toISOString();
    purchase.order.status = "Order Created";
    return getAssetRegistry('org.acme.sintegralabsbc.Order')
        .then(function (assetRegistry) {
            return assetRegistry.update(purchase.order);
        });
}
/**
 * Record a request to purchase
 * @param {org.acme.sintegralabsbc.Buy} purchase - the order to be processed
 * @transaction
 */
function Buy(purchase) {
    
    purchase.order.financeco = purchase.financeco;
  
    purchase.order.buyer.balance -= purchase.order.amount;
    purchase.order.financeco.balance += purchase.order.amount;
    
    purchase.order.boughtDate = new Date().toISOString();
    purchase.order.status = "Purchased";
    return getAssetRegistry('org.acme.sintegralabsbc.Order')
        .then(function (assetRegistry) {
            return assetRegistry.update(purchase.order);
        }).then(function () {
            return getParticipantRegistry('org.acme.sintegralabsbc.Buyer')
        }).then (function (buyerRegistry) {
            return buyerRegistry.update(purchase.order.buyer);
        }).then(function () {
            return getParticipantRegistry('org.acme.sintegralabsbc.FinanceCo')
        }).then (function (financeCoRegistry) {
            return financeCoRegistry.update(purchase.order.financeco);
        });
}
 /**
 * Record a request for payment by the seller
 * @param {org.acme.sintegralabsbc.RequestPayment} purchase - the order to be processed
 * @transaction
 */
function RequestPayment(purchase) {
    
    if (purchase.order.status =! "Purchased"){
    	throw new Error("your order is not purchased");
    } 
    if (purchase.seller =! purchase.order.seller){
    	throw new Error("this order is for another seller");
    } 
    purchase.order.status = "Payment Requested";
    purchase.order.paymentRequestedDate = new Date().toISOString();
    
    return getAssetRegistry('org.acme.sintegralabsbc.Order')
        .then(function (assetRegistry) {
            return assetRegistry.update(purchase.order);
        });
}
 /**
 * Record a payment to the seller
 * @param {org.acme.sintegralabsbc.Pay} purchase - the order to be processed
 * @transaction
 */
function Pay(purchase) {
    
    if (purchase.order.status =! "Payment Requested"){
    	throw new Error("your order is not purchased");
    } 
     purchase.order.financeco.balance -= purchase.order.amount;
     purchase.order.seller.balance += purchase.order.amount;
     purchase.order.status = "Paid";
     purchase.order.paid = new Date().toISOString();
    
  
    return getAssetRegistry('org.acme.sintegralabsbc.Order')
        .then(function (assetRegistry) {
            return assetRegistry.update(purchase.order);
        }).then(function () {
            return getParticipantRegistry('org.acme.sintegralabsbc.FinanceCo')
        }).then (function (financeCoRegistry) {
            return financeCoRegistry.update(purchase.order.financeco);
        }).then(function () {
            return getParticipantRegistry('org.acme.sintegralabsbc.FinanceCo')
        }).then (function (financeCoRegistry) {
            return financeCoRegistry.update(purchase.order.seller);
        });
}


/**
 * Record a request to ship by supplier to shipper
 * @param {org.acme.sintegralabsbc.RequestShipping} purchase - the order to be processed
 * @transaction
 */
function RequestShipping(purchase) {
  
    purchase.order.requestShipment = new Date().toISOString();
    purchase.order.status = "Shipment Requested";
    return getAssetRegistry('org.acme.sintegralabsbc.Order')
        .then(function (assetRegistry) {
            return assetRegistry.update(purchase.order);
        });
}
/**
 * Record a delivery by shipper
 * @param {org.acme.sintegralabsbc.Deliver} purchase - the order to be processed
 * @transaction
 */
function Deliver(purchase) {
    if (purchase.order.status =! "Shipment Requested"){
    	throw new Error("your shippment is not requested");
    } 
    purchase.order.delivered = new Date().toISOString();
    purchase.order.status = "Delivered";
    return getAssetRegistry('org.acme.sintegralabsbc.Order')
        .then(function (assetRegistry) {
            return assetRegistry.update(purchase.order);
        });
}

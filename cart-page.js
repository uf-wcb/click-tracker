import {local} from 'wix-storage';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import cart from 'wix-stores';
import wixData from 'wix-data';

$w.onReady(function () {
	let userId = session.getItem("userId");
	let experimentId = session.getItem("experimentId");

	$w("#checkoutButton").onClick(function() {
		cart.getCurrentCart()
			.then((cart) => {
				if(userId) saveEvent(cart);
			})
			.catch((error) => {
				console.error(error);
			});
			wixWindow.openLightbox("thankyou");
	});
	
	function saveEvent(cart) {
		let prevUrl = "cart";
		let curUrl = "cart"
		let action = "checkout";
		let itemsInCart = [];
		let item = "";

		if(curUrl == "list" && wixLocation.query["page"] != undefined) curUrl = "list - page " + wixLocation.query["page"];
		if (!cart) session.setItem("page", curUrl);
		if(cart) {
			item = "";
			for(var i = 0; i < cart.lineItems.length; i++) {
				itemsInCart.push(cart.lineItems[i].name.replace(/ /g, "-").toLowerCase() + "#" + cart.lineItems[i].quantity);
			}
			session.setItem("cartLocal", JSON.stringify(cart));
		}
		logEvent(userId, experimentId, curUrl, prevUrl, action, item, itemsInCart.join(" : "), cart );
	}

	function logEvent (userId, experimentId, url, referrer, action, item, itemsInCart, cart ) {
		let toInsert = {
			"userId": userId,
			"experimentId": experimentId,
			"url": (url.length) ? url : "list",
			"referrer": referrer,	
			"action": action,
			"item": item,
			"itemsInCart": itemsInCart,
			"cart": cart
		};

		wixData.insert("UserTracking", toInsert)
			.then( (results) => {
				//console.log(results); 
			})
			.catch( (err) => {
				console.error(err);
			});
	}
});

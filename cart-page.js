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
				if(userId) saveEvent(cart,'checkout');
			})
			.catch((error) => {
				console.error(error);
			});
			wixWindow.openLightbox("thankyou");
	});
		
	function saveEvent(cart,actionText) {
		let prevUrl = "cart";
		let curUrl = "cart";
		let action = actionText;
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
		wixWindow.openLightbox("thankyou");
	}

	function logEvent (userId, experimentId, url, referrer, action, item, itemsInCart, cart ) {

		const time = new Date();
		let h = addZero(time.getHours(), 2);
		let m = addZero(time.getMinutes(), 2);
		let s = addZero(time.getSeconds(), 2);
		let ms = addZero(time.getMilliseconds(), 3);
		let dateTime = h + ":" + m + ":" + s + ":" + ms;

		let toInsert = {
			"userId": userId,
			"experimentId": experimentId,
			"url": (url.length) ? url : "list",
			"referrer": referrer,	
			"action": action,
			"item": item,
			"itemsInCart": itemsInCart,
			"cart": cart,
			"time": time.getTime(),
			"dateTime": dateTime			
		};

		wixData.insert("UserTracking", toInsert)
			.then( (results) => {
				//console.log(results); 
			})
			.catch( (err) => {
				console.error(err);
			});
	}

	function addZero(x, n) {
		while (x.toString().length < n) {
			x = "0" + x;
		}
		return x;
	}

});

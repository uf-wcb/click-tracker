import {local} from 'wix-storage';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import cart from 'wix-stores';
import wixData from 'wix-data';

// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

$w.onReady(function () {

	let userId = local.getItem("userId");
	let experimentId = local.getItem("experimentId");

	$w("#checkoutButton").onClick(function() {
		console.log("clicked");
		cart.getCurrentCart()
			.then((currentCart) => {
				// const cartId = currentCart._id;
				// const cartLineItems = currentCart.lineItems;
				// console.log("currentCart");
				// console.log(currentCart);
				saveEvent(currentCart);
			})
			.catch((error) => {
				console.error(error);
			});
			wixWindow.openLightbox("thankyou");
	});
	
	function saveEvent(cart) {
		//console.log(wixLocation.query["page"]);
		// console.log("cart");
		// console.log(cart);
		//console.log("saveEvent");
		let prevUrl = "cart";
		let curUrl = wixLocation.path.join("/");
		let previousQuantity = local.getItem("previousQuantity");
		let action = "checkout";
		let itemsInCart = [];
		let itemsInCartLocal = [];
		let item = "";
		let cartLocal = JSON.parse(local.getItem("cartLocal"+userId));
		let member = JSON.parse(local.getItem("member"+userId));

		curUrl = "cart";
		if(curUrl == "list" && wixLocation.query["page"] != undefined) curUrl = "list - page " + wixLocation.query["page"];
		if (!cart) local.setItem("page", curUrl);

		if(cart) {
			item = "";
			
			for(var i = 0; i < cart.lineItems.length; i++) {
				itemsInCart.push(cart.lineItems[i].name.replace(/ /g, "-").toLowerCase() + "#" + cart.lineItems[i].quantity);
			}

			local.setItem("previousQuantity", cart.totals.quantity);
			local.setItem("cartLocal", JSON.stringify(cart));
		} else {
			action = "omg";
		}
		logEvent(userId, experimentId, curUrl, prevUrl, action, item, itemsInCart.join(" : "), cart, member );
	}

	function logEvent (userId, experimentId, url, referrer, action, item, itemsInCart, cart, member) {
		let toInsert = {
			"userId": userId,
			"memberId": member.contactDetails.contactId,
			"experimentId": experimentId,
			"url": (url.length) ? url : "list",
			"referrer": referrer,	
			"action": action,
			"item": item,
			"itemsInCart": itemsInCart,
			"cart": cart,
			"member": member
		};

		wixData.insert("UserTracking", toInsert)
			.then( (results) => {
				//console.log(results); 
			})
			.catch( (err) => {
				console.log(err);
			});
	}


	// To select an element by ID use: $w('#elementID')
	
	// Click 'Preview' to run your code
});

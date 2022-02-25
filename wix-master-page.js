import {local} from 'wix-storage';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import wixStores from 'wix-stores';
import wixData from 'wix-data';

let experimentId = session.getItem("experimentId");
let userId = session.getItem("userId");

$w.onReady(function () {

	if (!userId) {
		wixWindow.openLightbox("login");
	} else {
		wixStores.getCurrentCart()
			.then((cart) => {

				session.setItem("cartLocal"+userId, JSON.stringify(cart));

				saveEvent();

				wixLocation.onChange( (location) => {
					saveEvent();
				});

				wixStores.onCartChanged((cart) => {
					saveEvent(cart);
				});		
								
			})
			.catch((error) => {
				console.error(error);
			});
	}

});

function showLightbox(){
	wixWindow.openLightbox("login");
}

function saveEvent(cart) {
	let prevUrl = session.getItem("page"+userId);
	let curUrl = wixLocation.path.join("/");
	let previousQuantity = JSON.parse(session.getItem("cartLocal"+userId)).totals.quantity;//local.getItem("previousQuantity"+userId);
	let action = "";
	let itemsInCart = [];
	let itemsInCartLocal = [];
	let itemsInCartStr = "";
	let itemsInCartObj = {};
	let item = "";
	let cartLocal = JSON.parse(session.getItem("cartLocal"+userId));

	if(!curUrl.length) curUrl = "list";
	if(curUrl == "list" && wixLocation.query["page"] != undefined) curUrl = "list - page " + wixLocation.query["page"];
	if (!cart) session.setItem("page"+userId, curUrl);

	if(cart) {
		// Determine if an item was added or removed based on quantity
		if(cart.totals.quantity < previousQuantity) {
			action = "removed";
		}

		// Determine if an item was added or removed based on quantity
		if(cart.totals.quantity > previousQuantity) {
			action = "added";
		}
		
		// Create list of items in cart by name seperated by |
		for(var i = 0; i < cart.lineItems.length; i++) {
			itemsInCart.push(cart.lineItems[i].name.replace(/ /g, "-").toLowerCase() + "#" + cart.lineItems[i].quantity);
		}

		// If cart local figure out what item was added or removed
		if(cartLocal) {
			// Create list of items in cart by name seperated by |
			for(var i = 0; i < cartLocal.lineItems.length; i++) {
				itemsInCartLocal.push(cartLocal.lineItems[i].name.replace(/ /g, "-").toLowerCase() + "#" + cartLocal.lineItems[i].quantity);
			}	

			// Figure out what item was added or removed from cart
			if(action == "added") {
				for(var i = 0; i < itemsInCart.length; i++) {
					if(!itemsInCartLocal.includes(itemsInCart[i])) {
						item = itemsInCart[i].split("#")[0];
						break;
					}
				}
			} else {
				for(var i = 0; i < itemsInCartLocal.length; i++) {
					if(!itemsInCart.includes( itemsInCartLocal[i])) {
						item = itemsInCartLocal[i].split("#")[0];
						break;
					}
				}					
			}
		} else {
			item = cart.lineItems[0].name.replace(/ /g, "-").toLowerCase();
		}

		itemsInCartStr = itemsInCart.join(" : ");
		itemsInCartObj = cart;
		session.setItem("cartLocal"+userId, JSON.stringify(cart));
	} else {
		if(cartLocal) {
			// Create list of items in cart by name seperated by |
			for(var i = 0; i < cartLocal.lineItems.length; i++) {
				itemsInCartLocal.push(cartLocal.lineItems[i].name.replace(/ /g, "-").toLowerCase() + "#" + cartLocal.lineItems[i].quantity);
			}	
			itemsInCartStr = itemsInCartLocal.join(" : ");
			itemsInCartObj = cartLocal;
		}
	}
	logEvent(userId, experimentId, curUrl, prevUrl, action, item, itemsInCartStr, itemsInCartObj );
}

function logEvent (userId, experimentId, url, referrer, action, item, itemsInCart, cart) {
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

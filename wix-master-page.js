import {local} from 'wix-storage';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import wixStores from 'wix-stores';
import wixData from 'wix-data';
import { currentMember } from 'wix-members';

let experimentId = wixLocation.baseUrl;
let suppliedId = wixLocation.query["id"];

if (suppliedId) {
	local.setItem("userId", suppliedId);
	local.setItem("experimentId", experimentId);
}

let userId = local.getItem("userId");
let memberObj = {};

$w.onReady(function () {
	currentMember.getMember()
		.then((member) => {
			local.setItem("member"+suppliedId, JSON.stringify(member));
			wixStores.getCurrentCart()
				.then((cart) => {
					if (suppliedId) {
						local.setItem("cartLocal"+userId, JSON.stringify(cart));
					}

					if (userId) {
						// wixData.query("UserCartTracking")
						// .eq("userId", "blackpanther")
						// .find()
						// .then( (results) => {
						// 	if(results.items.length > 0) {
						// 		let firstItem = results.items[0]; //see item below
						// 		console.log("firstItem");
						// 		console.log(firstItem);
						// 	} else {
						// 		console.log("no matches");
						// 	// handle case where no matching items found
						// 	}
						// } )
						// .catch( (err) => {
						// 	console.log("wixdataqueryerr");
						// 	console.log(err);
						// 	let errorMsg = err;
						// } );

						saveEvent();

						wixLocation.onChange( (location) => {
							console.log("onChange**");
							saveEvent();
						} );

						wixStores.onCartChanged((cart) => {
							console.log("onCartChanged**");
							console.log(cart);
							if (!suppliedId) saveEvent(cart);
						});	
					} else {
						setTimeout(() => showLightbox(), 1000);
					}						
				})
				.catch((error) => {
					console.error(error);
				});
		return member;
		})
		.catch((error) => {
			console.error(error);
		});

	function showLightbox(){
		wixWindow.openLightbox("wcblightbox");
	}

	function saveEvent(cart) {
		console.log("saveEvent");
		let prevUrl = local.getItem("page"+userId);
		let curUrl = wixLocation.path.join("/");
		let previousQuantity = JSON.parse(local.getItem("cartLocal"+userId)).totals.quantity;//local.getItem("previousQuantity"+userId);
		console.log("previousQuantity");
		console.log(previousQuantity);	
		let action = "";
		let itemsInCart = [];
		let itemsInCartLocal = [];
		let itemsInCartStr = "";
		let itemsInCartObj = {};
		let item = "";
		let cartLocal = JSON.parse(local.getItem("cartLocal"+userId));
		let member = JSON.parse(local.getItem("member"+userId));

		if(!curUrl.length) curUrl = "list";
		if(curUrl == "list" && wixLocation.query["page"] != undefined) curUrl = "list - page " + wixLocation.query["page"];
		if (!cart) local.setItem("page"+userId, curUrl);

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
			local.setItem("previousQuantity"+userId, cart.totals.quantity);
			local.setItem("cartLocal"+userId, JSON.stringify(cart));
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
		console.log(member);
		logEvent(userId, experimentId, curUrl, prevUrl, action, item, itemsInCartStr, itemsInCartObj, member );
	}

});

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

function clearCart() {
	wixStores.getCurrentCart()
		.then((cart) => {
			let cartItems = cart.lineItems;
			cartItems.forEach(item => {
				//wixStores.cart.removeProduct(item.id).then;
				wixStores.cart.removeProduct(item.id)
					.then((updatedCart) => {
						// console.log("removeProduct");
						// console.log(updatedCart.totals.quantity);
						// console.log(item.id);
					})
					.catch((error) => {
						// Product not removed
						console.error(error);
					});
				//setTimeout(() => loadUserData(), 500);
				
				console.log("clearCart");
				console.log(item.id);
			});

			//console.log("clearCart");
			console.log("setTimeoutForLoadUserData");
		    setTimeout(() => loadUserData(), 6000);
		});

}

function loadUserData() {
	let products = JSON.parse(local.getItem("cartLocal"+suppliedId));
	console.log("products");
	console.log(products);
	
	if(products) {
		console.log("products&&cartLineItems");
		wixStores.cart.addProducts(products.lineItems)
		.then((updatedCart) => {
			console.log("updatedCart");
			console.log(updatedCart);
		})
		.catch((error) => {
			// Products not added to cart
			console.error(error);
		});
	}
}

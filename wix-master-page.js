import {session} from 'wix-storage';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import wixStores from 'wix-stores';
import wixData from 'wix-data';

let experimentId = wixLocation.baseUrl;
let suppliedId = wixLocation.query["id"];
if (suppliedId) {
	session.clear();
	clearCart();
	session.setItem("userId", suppliedId);
	//console.log("reseting");
}
let userId = session.getItem("userId");

$w.onReady(function () {

	//console.log("onReady");

	if (userId) {

		saveEvent();

		wixLocation.onChange( (location) => {
			// if(wixLocation.path.join("/").length) {
			// 	var btn = $w("#wcbbuynow");
			// 	btn.label = "Buy Now!";
			// 	btn.enable();
			// }
			//console.log("onChange");
			saveEvent();
		} );

		// if(wixLocation.path.join("/").includes("product-page")) {
		// 	$w("#wcbbuynow").onClick( (event) => {
		// 		var btn = $w("#wcbbuynow");
		// 		btn.label = "Purchased!";
		// 		btn.disable();
		// 		saveEvent(true);
		// 	});
		// }

		wixStores.onCartChanged((cart) => {
			//console.log("onCartChanged");
		 	if (!suppliedId) saveEvent(cart.lineItems);
		});	
	} else {
		setTimeout(() => showLightbox(), 1500);
	}

	function showLightbox(){
		wixWindow.openLightbox("wcblightbox");
	}

	function saveEvent(cart) {
		//console.log("saveEvent");
		let prevUrl = session.getItem("page");
		let curUrl = wixLocation.path.join("/");
		let purchased = (cart) ? true : false;
		if(!curUrl.length) curUrl = "list";
		if (!cart) session.setItem("page", curUrl);

		logEvent(userId, experimentId, curUrl, prevUrl, purchased);
	}

});

function logEvent (userId, experimentId, url, referrer, purchased) {
	//console.log("logEvent");
	let toInsert = {
		"userId": userId,
		"experimentId": experimentId,
		"url": (url.length) ? url : "list",
		"referrer": referrer,
		"purchased" : purchased
	};

	wixData.insert("UserTracking", toInsert)
		.then( (results) => {
			//console.log(results); 
		} )
		.catch( (err) => {
			console.log(err);
		} );
}

function clearCart() {
	wixStores.getCurrentCart()
		.then((cart) => {
			let cartItems = cart.lineItems;
			cartItems.forEach(item => {
				wixStores.removeProductFromCart(item.id);
			});
		});
}

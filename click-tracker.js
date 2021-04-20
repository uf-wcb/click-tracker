(function($) {

    $(function() {

        //alert(wcbGetUrlParameter("visitor_id") + "OMG");

        // Click event for all links on the page
        $( "body" ).on( "click", "a", function( event ) {

            var queryDict = {};
            location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
            console.log(queryDict);

            //event.preventDefault();

            // var href = $(this).attr("href");
            // var text = $(this).text();

            var obj =  {};

            obj.visitor_id = ( queryDict["visitor_id"] ) ? queryDict["visitor_id"] : null;
            obj.experiment_id = ( queryDict["experiment_id"] ) ? queryDict["experiment_id"] : null;
            obj.clicked_link_text = $(this).text();
            obj.clicked_link_url = $(this).attr("href");
            obj.current_page_url = window.location.href;
            obj.previous_page_url= ( document.referrer ) ? document.referrer : null;
            
            console.log(obj);

            // var jqxhr = $.get( "https://betaasset.warrington.ufl.edu/public-services/click-tracking/api", function( data ) {
            // console.log(data);    
            // //alert( "success" );
            // })
            // .done(function(data) {
            //     console.log(data);
            //    //alert( "second success" );
            // })
            // .fail(function( jqXHR, textStatus ) {
            //     alert( "Request failed: " + textStatus );
            // });
            
            if( obj.visitor_id != null && obj.experiment_id != null ) {

                // var request = $.ajax({
                //     url: "https://betaasset.warrington.ufl.edu/public-services/click-tracking/api",
                //     method: "POST",
                //     data: obj,
                //     dataType: "json"
                // });
                
                // request.done(function( msg ) {
                //     console.log(msg);

                //     alert(JSON.stringify(obj));
                
                //     if( !$(this).attr("href").startsWith("#") ) {
                //         window.location = $(this).attr("href") + window.location.search;
                //     }
                // });
                
                // request.fail(function( jqXHR, textStatus ) {
                //     alert( "Request failed: " + textStatus );
                // });

                alert(JSON.stringify(obj));
                
                if( !$(this).attr("href").startsWith("#") ) {
                    window.location = $(this).attr("href") + window.location.search;
                }
            }

        });

    });

})( jQuery );

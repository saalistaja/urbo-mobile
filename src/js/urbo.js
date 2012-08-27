function onFail(message) {
    alert ("Photo fail!");
}

function onPhotoSuccess(photoURI) {
    console.log("Selected photo on uri: " + photoURI);
    $("#photoThumbnail").attr("src", photoURI)

}

function getPhoto(photoSourceType) {
    $('.ui-dialog').dialog('close');
    navigator.camera.getPicture(onPhotoSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: photoSourceType
    });
}

function retrieveMapForLocation(latitude, longitude) {
    var url = 'http://maps.google.com/maps/api/staticmap?center=' + latitude + ',' + longitude + '&zoom=15&size=100x100&maptype=roadmap&markers=color:red%7C' + latitude + ',' + longitude + '&sensor=true'
    mapDataView = document.getElementById("mapThumbnail");
    return url;
}

function refreshLocation(latitude, longitude) {
    console.log("Retrieved GPS coordinates " + latitude + "," + longitude);
    $('body').data("latitude", latitude);
    $('body').data("longitude", longitude);
    $("#mapThumbnail").attr("src", retrieveMapForLocation(latitude, longitude));
}

function onGpsCoordsSuccess(position) {
    refreshLocation(position.coords.latitude, position.coords.longitude);
}

function onGpsCoordsError(error) {
    $("#mapThumbnail").attr("src", "")
}
function getGpsCoordinates() {
    navigator.geolocation.getCurrentPosition(onGpsCoordsSuccess, onGpsCoordsError, { enableHighAccuracy: true });
}

var map, marker;

function createMarker(latlng) {
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        zIndex: Math.round(latlng.lat()*-100000)<<5
    });
    return marker;
}

function showMapToAdjust(latitude, longitude) {
    var myOptions = {
        zoom: 15,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeControl: false,
        zoomControl: true,
        scaleControl: false,
        streetViewControl: false,
        navigationControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("mapWindow"), myOptions);
    marker = createMarker(map.center)

    google.maps.event.addListener(map, 'click', function(event) {
        //call function to create marker
        if (marker) {
            marker.setMap(null);
            marker = null;
        }
        marker = createMarker(event.latLng);
    });
}

function locationManuallySelected() {
    if(marker != null) {
        console.log(marker.position.lat());
        console.log(marker.position.lng());
        refreshLocation(marker.position.lat(), marker.position.lng());
    }
    $('.ui-dialog').dialog('close')
}

function photoUploadSuccessHandler(response) {
    console.log("Photo was successfully uploaded" + response);
    console.log(response.response);
    var photoId = JSON.parse(unescape(response.response)).photoId;
    console.log("Photo id: " + photoId);
    uploadData(photoId);
}

function photoUploadErrorHandler(error) {

    var errorInfo = error.code + " - "

    /*
     * founded in apache cordova for android - FileTransfer.java
     *
     *  public static int FILE_NOT_FOUND_ERR = 1;
     *	public static int INVALID_URL_ERR = 2;
     *	public static int CONNECTION_ERR = 3;
     */

    switch (error.code) {

        case 1 :  errorInfo += "file not found"; break;
        case 2 :  errorInfo += "invalid url"; break;
        case 3 :  errorInfo += "connection error"; break;

    }

    console.error("Error occured during photo uploading. Error info: " + errorInfo, error);
    alert("Photo uploading failed. An error has occurred: Error: " + errorInfo);
    $('.ui-dialog').dialog('close')

}


function uploadPhoto(photoUploadSuccessHandler, photoUploadErrorHandler) {
    var photoUri = $('#photoThumbnail').attr('src');
    console.log("Uploading photo: " + photoUri);
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = photoUri.substr(photoUri.lastIndexOf('/')+1);
    options.mimeType = "image/jpeg";

    var params = new Object();
    params.value1 = "test";
    params.value2 = "param";

    options.params = params;

    var ft = new FileTransfer();
    ft.upload(photoUri, Urbo.Settings.Api.getPhotoUploadUrl(), photoUploadSuccessHandler, photoUploadErrorHandler, options);

}

function uploadData(photoId) {
    $('#send_message').text("Odesílám data...");
    var jsonObj = {
        "feedback": {
            "title": $("#title").val(),
            "description": $("#description").val(),
            "latitude": $('body').data('latitude'),
            "longitude": $('body').data('longitude'),
            "photo_id": photoId,
            "identification": $('body').data('identification'),
            "provider": $('body').data('provider'),
            "name": $('body').data('name')
        }
    }
    
    console.log(Urbo.Settings.Api.getUrboItemSaveUrl());
    
    var dataAsString = JSON.stringify(jsonObj);
    
    console.log(dataAsString);
    $.ajax({
        headers: {"Content-Type": "application/json"},
        type: "POST",
        url: Urbo.Settings.Api.getUrboItemSaveUrl(),
        data: dataAsString,
        context: document.body
    }).done(function() {
            console.log('Message sent.');
            $('#send_message').text("Hotovo.");
            $('.ui-dialog').dialog('close')
            $.mobile.changePage('#menu','flip',false,true)

        }).fail(function (error_message) {
            console.log('Message failed.');
            console.log(error_message);
            $('.ui-dialog').dialog('close')
        });
}

function validateData() {
    if (!$('body').data("identification")) {
        $('#error_message').text("Prosím, přihlaš se!")
        $.mobile.changePage('#error_dialog','pop',false,true)
        return false;
    }

    if (!$("#title").val()) {
        $('#error_message').text("Prosím, přidej titulek!")
        $.mobile.changePage('#error_dialog','pop',false,true)
        return false;
    }

    if (!$('body').data('latitude')) {
        $('#error_message').text("Prosím, oprav místo!")
        $.mobile.changePage('#error_dialog','pop',false,true)
        return false;
    }

    if (!$('#photoThumbnail').attr('src')) {
        $('#error_message').text("Prosím, přidej fotku!")
        $.mobile.changePage('#error_dialog','pop',false,true)
        return false;
    }
    return true;
}

function sendUrboItemToServer() { /* save the world */
    if (validateData()) {
        console.log("Sending with user: " + $('body').data("e-mail"));
        $.mobile.changePage('#send_dialog','pop',false,true)
        uploadPhoto(photoUploadSuccessHandler, photoUploadErrorHandler) /* inside photoUploadSuccessHandler it calls uploadData */
    }
}

function dismissDialog() {
    $('.ui-dialog').dialog('close');
}

function googleOAuth() {
    oAuth(Urbo.Settings.Oauth.Google.ClientId,
        Urbo.Settings.Oauth.Google.CallbackURL,
        "https://accounts.google.com/o/oauth2/auth",
        "https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/oauth2/v2/userinfo",
        "Google"
    );
}

function facebookOAuth() {
    oAuth(Urbo.Settings.Oauth.Facebook.ClientId,
        Urbo.Settings.Oauth.Facebook.CallbackURL,
        "https://m.facebook.com/dialog/oauth",
        "user_about_me+email",
        "https://graph.facebook.com/me",
        "Facebook"
    );
}

function oAuth(client_id, redirect_uri, authorize_url, scope, userinfo_url, provider) {

    authorize_url +=  "?response_type=token";
    authorize_url += "&scope=" + scope;
    //authorize_url += "&scope=https://www.googleapis.com/auth/userinfo.profile"; returns name etc.
    authorize_url += "&client_id=" + client_id;
    authorize_url += "&redirect_uri=" + redirect_uri;

    client_browser = window.plugins.childBrowser;

    console.log('Opening authorize URL: ' + authorize_url);
    client_browser.onLocationChange = function(loc){
        if (loc.indexOf(redirect_uri) > -1) {
            var access_token = loc.match(/access_token=(.*)$/)[1]
            console.log('Access token is: ' + access_token);
            client_browser.close();
            console.log('encoded token: ' + encodeURIComponent(access_token));
            console.log('encoded uri: ' + encodeURIComponent(redirect_uri));

            $.ajax({
                headers: {"Content-Type": "application/json"},
                type: "GET",
                url: userinfo_url + "?access_token=" + access_token,
                context: document.body,
                dataType: "json"
            }).done(function(data) {
                    console.log('Obtained profile: ' + JSON.stringify(data));
                    parseoAuthUser(data, provider);
                }).fail(function (data) {
                    console.log('Profile request failed: ' + JSON.stringify(data));
                }
            );
        }
    };


    if (client_browser != null) {
        client_browser.showWebPage(authorize_url);
    }
}

function parseoAuthUser(data, provider) {
    console.log('email: ' + data.email);
    $('body').data("identification", data.email);
    $('body').data("name", data.name);
    $('body').data("provider", provider);
    $('#login_button .ui-btn-text').text(data.name + "@" + provider)
}


/**
 * Allows anonymous case submission.
 */
function anonAuth() {
    $('body').data("identification", "anonymous");
    $('body').data("name", "Anonymní zbabělec");
    $('body').data("provider", "None");
    $('#login_button .ui-btn-text').text($('body').data("name"));
    return true;
}

function newCase() {
    //store the current page id
    $('body').data("currentPageId", "create");

    getGpsCoordinates();
    $("#title").val(null);
    $("#description").val(null);
    $('#photoThumbnail').attr('src', null);
    //$.mobile.changePage('#create','flip',false,true);
}

function listMyCases() {
    //store the current page id
    $('body').data("currentPageId", "mycases");
    
    if($('body').data("provider") == undefined) {
        document.getElementById('myCasesLoginMessage').style.display = 'block';
        return;
    } else {
        document.getElementById('myCasesLoginMessage').style.display = 'none';
    }
    
    // we have already some feedbacks
    if($('body').data("feedbacks") != undefined) {
        return;
    }
    
    console.log("Looking for cases of: " + $('body').data("identification"));
    $('#send_message').text("Hledám případy...");
    $.mobile.changePage('#send_dialog','pop',false,true)

    var jsonObj = {
        "author": {
            "identification": $('body').data("identification"),
            "provider": $('body').data("provider")
        }
    }
    console.log(Urbo.Settings.Api.getUrboListCasesUrl());

    var dataAsString = JSON.stringify(jsonObj);
    console.log(dataAsString);
    $.ajax({
           headers: {"Content-Type": "application/json"},
           type: "POST",
           url: Urbo.Settings.Api.getUrboListCasesUrl(),
           data: dataAsString,
           context: document.body
           }).done(function(data) {
                   console.log('Message sent.');
                   console.log(data);
                   if(data.feedbacks.length == 0) {
                       document.getElementById('myCasesEmptyMessage').style.display = 'block';
                   } else {
                       var feedbacks = data.feedbacks;
                       document.getElementById('myCasesEmptyMessage').style.display = 'none';
                       $('body').data("feedbacks", feedbacks);
                       
                       var lastDateUpdated = null;
                       for(var i = 0; i < feedbacks.length; i++) {
                           if(lastDateUpdated != feedbacks[i].lastUpdated) {
                                $("#dateSeparatorTemplate").tmpl(feedbacks[i]).appendTo("#myCasesListView");
                           }
                           lastDateUpdated = feedbacks[i].lastUpdated;
                           feedbacks[i].url = Urbo.Settings.Api.getUrboImageThumbnailUrl(feedbacks[i].photoId);
                           $("#caseItemTemplate").tmpl(feedbacks[i]).appendTo("#myCasesListView");
                       }
                   }
                   $('#send_message').text("Hotovo.");
                   dismissDialog();
           }).fail(function () {
                   console.log('Message failed.');
                   dismissDialog();
           });
}

function refreshCases() {
    $('body').data("feedbacks", null);
    $('#myCasesListView').empty();
    listMyCases();
    return false;
}

function caseDetail(caseId) {
    var feedbacks = $('body').data("feedbacks");
    var i;
    for(i = 0; i < feedbacks.length; i++) {
        if(caseId == feedbacks[i].id) {
            break;
        }
    }
    if(i < feedbacks.length) {
        $("#detailTitle").html(feedbacks[i].title);
        $("#detailDateCreated").html("Založeno: " + feedbacks[i].dateCreated);
        $("#detailLastUpdated").html("Změněno: " + feedbacks[i].lastUpdated);
        $("#detailState").html(feedbacks[i].state);
        $("#detailPhotoThumbnail").attr("src", Urbo.Settings.Api.getUrboImageThumbnailUrl(feedbacks[i].photoId));
        $("#detailMapThumbnail").attr("src", retrieveMapForLocation(feedbacks[i].latitude, feedbacks[i].longitude));
        document.getElementById("detailDescription").innerHTML = "Popis: " + feedbacks[i].description;
        console.log(Urbo.Settings.Api.getUrboImageThumbnailUrl(feedbacks[i].photoId));
    }
}

var Urbo = Urbo || {};
Urbo.Settings = Urbo.Settings || {};
Urbo.Settings.Api = Urbo.Settings.Api || {};
Urbo.Settings.Oauth = Urbo.Settings.Oauth || {};
Urbo.Settings.Oauth.Google = Urbo.Settings.Oauth.Google || {};
Urbo.Settings.Oauth.Facebook = Urbo.Settings.Oauth.Facebook || {};


/* 
 * @param relativeApiUrl - relative to context of app for example when full address should be 
 * 						   "http://192.168.200.209:8080/web/api/v1/uploadPhoto", relative part is 
 * 						   "/web/api/v1/uploadPhoto"  
 * 
 */
Urbo.Settings.Api.createFullUrlFor = function(relativeApiUrl) {

    return this.protocol + "://" + this.hostName + ":" + this.hostPort + Urbo.Settings.Api.context + relativeApiUrl;

};

Urbo.Settings.Api.protocol = "http";

//Localhost environment
Urbo.Settings.Api.hostName = "localhost";
Urbo.Settings.Api.context = "/urbo";
Urbo.Settings.Api.hostPort = "8080";

//Production environment
//Urbo.Settings.Api.hostName = "urbo.herokuapp.com";
//Urbo.Settings.Api.context = "";
//Urbo.Settings.Api.hostPort = "80";

Urbo.Settings.Api.photoUploadRelativeUrl = "/api/v1/uploadPhoto";
Urbo.Settings.Api.urboItemSaveRelativeUrl = "/api/v1/case";

Urbo.Settings.Api.urboListCases = "/apiFeedback/findByAuthor"
Urbo.Settings.Api.imageUrl = "/api/v1/thumbnail/${imageId}/100/100";

Urbo.Settings.Api.urboListCases = "/apiFeedback/findByAuthor";


Urbo.Settings.Oauth.Google.CallbackURL = "http://" + Urbo.Settings.Api.hostName + "/oauth2callback";
Urbo.Settings.Oauth.Google.ClientSecret = "NMaJccwi-j_kHLFYRDTFiUZv";
Urbo.Settings.Oauth.Google.ClientId = "445034773821-iv2qgdkf4a50paekcaq0kkrseolgc00m.apps.googleusercontent.com";

Urbo.Settings.Oauth.Facebook.ClientSecret = "658ce4d04f10ee67aff932f131f1e99f";
Urbo.Settings.Oauth.Facebook.ClientId = "277531465694194";
Urbo.Settings.Oauth.Facebook.CallbackURL = "http://" + Urbo.Settings.Api.hostName + "/oauth2callback";

Urbo.Settings.Api.getPhotoUploadUrl = function() {
    return this.createFullUrlFor(this.photoUploadRelativeUrl);
};

Urbo.Settings.Api.getUrboItemSaveUrl = function() {
    return this.createFullUrlFor(this.urboItemSaveRelativeUrl);
};

Urbo.Settings.Api.getUrboListCasesUrl = function() {
    return this.createFullUrlFor(this.urboListCases);
}

Urbo.Settings.Api.getUrboImageThumbnailUrl = function(id) {
    var imgUrl = this.createFullUrlFor(this.imageUrl);
    imgUrl = imgUrl.replace("${imageId}", id);
    return imgUrl;
}

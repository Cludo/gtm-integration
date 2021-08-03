function CludoSession() {
    // this.sessionId = '';

    this.authorizationKey = '';
    // this.customerId = '';
    // this.engineId = '';
    // this.searchSiteKey = 'SearchKey';
    this.sessionIdKey = "cludoSessionId";
    this.sessionIdStartKey = "cludoSessionIdStart";
    // this.websiteSettings = [];
    this.sessionExpiration = 1800000; //30 minutes

    /**
     * Mimic localStorage to be able unify handling of session parameters
     */
    this.memoryStorageContainer = {
        storage: {},
        getItem: function (key) {
            return this.storage[key];
        },
        setItem: function (key, value) {
            this.storage[key] = JSON.stringify(value);
        },
        clear: function () {
            this.storage = {};
        },
        length: function () {
            return Object.keys(this.storage).length;
        },
        removeItem: function (key) {
            this.storage[key] = null;
        }
    };

    this.cachedStorageContainerReference = null;

    // this.searchApiUrl = (this.customerId >= 10000000) ? 'https://api-us1.cludo.com/api/v3' : 'https://api.cludo.com/api/v3';
}

CludoSession.prototype = {
    constructor: CludoSession,

    // init: function() {
    //     this.sessionId = this.getSessionId();
    // },

    // getWebsiteSettings: function() {
    //     var httpServiceUrl = this.searchApiUrl + "/" + this.customerId + "/" + this.engineId + "/websites/publicsettings";
    //     this.httpRequest("GET", httpServiceUrl, "settingsTemplate", '');
    // },

    sessionExpired: function(startTime) {
        if (!startTime)
            return true;

        return (Math.abs(new Date() - Date.parse(startTime) > this.sessionExpiration));
    },

    storageContainerSupported: function(storageContainer) {
        var mod = "cludojs";

        try {
            storageContainer.setItem(mod, mod);
            storageContainer.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Returns a storage container depending on client constraints. Be sure to only call
     * storage container interface methods when working with these objects
     */
    getStorageContainer: function() {
        if (this.cachedStorageContainerReference !== null) {
            return this.cachedStorageContainerReference;
        }

        try {
            // if user accepts cookie popup, allow for tracking
            if (this.storageContainerSupported(localStorage)) {
                this.cachedStorageContainerReference = localStorage;
                return localStorage;
            } else {
                this.cachedStorageContainerReference = this.memoryStorageContainer;
                return this.memoryStorageContainer;
            }
        } catch(err) {
            this.cachedStorageContainerReference = this.memoryStorageContainer;
            return this.memoryStorageContainer;
        }
        
    },

    // getSessionId: function() {
    //     // If localStorage does not exist (blocked, does not exist or any other cases)
    //     // or if we do not have permission to use cookies
    //     // we can use "memory" to hold session parameters.

    //     // Can we skip this part? I need to know more about what controls `this.websiteSettings.optOutCookieTracking`
    //     // if (!this.isPersistentTrackingAllowed()) {
    //     //     return this.getSessionIdFromStorage(this.memoryStorageContainer);
    //     // }

    //     // Using try/catch here to avoid error if cookies/storage are disabled in browser
    //     try {
    //         return this.getSessionIdFromStorage(this.getStorageContainer());
    //     } catch (e) {
    //         return this.getSessionIdFromStorage(this.memoryStorageContainer);
    //     }
    // },

    // getSessionIdFromStorage: function(storageContainer) {
    //     var currentSessionId = storageContainer.getItem(this.sessionIdKey);
    //     var currentSessionStart = storageContainer.getItem(this.sessionIdStartKey);


    //     if (!currentSessionId || this.sessionExpired(currentSessionStart)) {
    //         //Create new session
    //         currentSessionId = this.generateUUID();

    //         //Store in container
    //         storageContainer.setItem(this.sessionIdKey, currentSessionId);

    //     }

    //     //Update sliding expiration
    //     storageContainer.setItem(this.sessionIdStartKey, new Date());

    //     return currentSessionId;
    // },

    generateUUID: function() {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now();     // use high-precision timer if available
        }
        var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    },

    // getAuthorizationKey: function() {
    //     var key = this.customerId + ":" + this.engineId + ":" + this.searchSiteKey;
    //     var base64key = base64.encode(key);
    //     return base64key;
    // },

    // isPersistentTrackingAllowed: function() {
    //     if (this.websiteSettings.optOutCookieTracking) {
    //         return false;
    //     }
    //     return this._getIsTrackedSession();
    // },

    // HTTP REQUESTS
    // httpRequest: function(type, url, template, placeholder) {
    //     //for mulitpart/form use encoded string 
    //     var params = type === "POST" ? (this.xhrRequestHeader === "application/json" ? JSON.stringify(this.params) : "Params=" + encodeURIComponent(JSON.stringify(this.params))) : null;
    //     var xhr = new XMLHttpRequest();
    //     xhr.open(type, url, true);
    //     //xhr.withCredentials = true;
    //     xhr.onreadystatechange = (function(xhr, _self, template, placeholder) {
    //         return function() {
    //             _self.httpCallback(xhr, _self, template, placeholder, originalQuery);
    //         }
    //     })(xhr, this, template, placeholder);

    //     xhr.setRequestHeader("Content-type", this.xhrRequestHeader + ";charset=UTF-8");
    //     xhr.setRequestHeader("Accept", this.xhrRequestHeader);
    //     if (!this.intranetSearch) {
    //         xhr.setRequestHeader("Authorization", "SiteKey " + this.authorizationKey);
    //     }
    //     xhr.send(params);
    // },

    // httpCallback: function(xhr, _self, template, placeholder) {
    //     if (xhr.readyState === 4) {
    //         if (xhr.status == 200) {
    //             var data = JSON.parse(xhr.responseText);
    //             _self[template](data, placeholder); // in this case, only used to populate `this.websiteSettings.optOutCookieTracking`
    //         } else {
    //             // error, do something lol
    //         }
    //     }
    // },

    /** Stores a trait in whatever storage we are using
     * @param trait a key/value pair, where the key is the trait's name
     */
    storeUserTrait: function(trait) {
        var storageContainer = this.getStorageContainer();
        var currentSessionId = storageContainer.getItem(this.sessionIdKey);
        var currentSessionStart = storageContainer.getItem(this.sessionIdStartKey);

        if (!currentSessionId || this.sessionExpired(currentSessionStart)) {
            //Create new session
            currentSessionId = this.generateUUID();

            //Store in container
            storageContainer.setItem(this.sessionIdKey, currentSessionId);

        }

        var currentTraits = storageContainer.getItem('cludoGtmTraits');
        if (!currentTraits) { 
            currentTraits = {};
        } else {
            currentTraits = JSON.parse(currentTraits);
        }
        currentTraits[trait.key] = trait.value;
        currentTraits = JSON.stringify(currentTraits);
        storageContainer.setItem('cludoGtmTraits', currentTraits);
    }

};


// create a global
var cludoSession;
(function() {
    cludoSession = new CludoSession();
    // cludoSession.init();
})();
class CludoSession {
    sessionIdKey = "cludoSessionId";
    sessionIdStartKey = "cludoSessionIdStart";
    sessionExpiration = 1800000; //30 minutes

    memoryStorageContainer = {
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

    cachedStorageContainerReference = null;

    constructor() {

    }

    sessionExpired(startTime) {
        if (!startTime)
            return true;

        return (Math.abs(new Date() - Date.parse(startTime) > this.sessionExpiration));
    }

    storageContainerSupported(storageContainer) {
        var mod = "cludojs";

        try {
            storageContainer.setItem(mod, mod);
            storageContainer.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Returns a storage container depending on client constraints. Be sure to only call
     * storage container interface methods when working with these objects
     */
    getStorageContainer() {
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
        
    }

    generateUUID() {
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
    }

    createNewSession(storageContainer) {
        //Create new session
        var currentSessionId = this.generateUUID();

        //Store in container
        storageContainer.setItem(this.sessionIdKey, currentSessionId);

        //Update sliding expiration
        storageContainer.setItem(this.sessionIdStartKey, new Date());
    }

    /** Stores a trait in whatever storage we are using
     * @param traits table data passed by GTM representing user traits
     */
    storeUserTraits(traits) {
        var storageContainer = this.getStorageContainer();
        var currentSessionId = storageContainer.getItem(this.sessionIdKey);
        var currentSessionStart = storageContainer.getItem(this.sessionIdStartKey);

        if (!currentSessionId || this.sessionExpired(currentSessionStart)) {
            this.createNewSession(storageContainer);
        }

        var currentTraits = storageContainer.getItem('cludo-traits');
        if (!currentTraits) { 
            currentTraits = [];
        } else {
            currentTraits = JSON.parse(currentTraits);
        }

        for (var i = 0; i < traits.length; i++) {
            var trait = traits[i].traitValue;
            if (currentTraits.indexOf(trait) === -1) {
                currentTraits.push(trait);
            }
        }
        currentTraits = JSON.stringify(currentTraits);
        storageContainer.setItem('cludo-traits', currentTraits);
    }

}

export default new CludoSession();
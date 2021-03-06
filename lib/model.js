/**
 * Data model provider.
 *
 * @package appmaker
 * @author  Andrew Sliwinski <a@mozillafoundation.org>
 */

var localforage = require('localforage');
var watch = require('watchjs').watch;

/**
 * Constructor
 */
function Model () {
    var self = this;

    // Internal
    self._ns = '_model';
    self._ready = false;
    self._logger = function (prefix, msg) {
        if (typeof msg === 'undefined') {
            msg = prefix;
            prefix = 'Model';
        }

        if (msg) console.log('[' + prefix + '] ' + msg);
    };

    // Public
    self.history = {
        ftu: true,
        path: '/ftu'
    };
    self.locale = null;
    self.user = {
        name: null,
        location: null,
        avatar: null
    };
    self.apps = [
        {
            id: '000d1745-5d3c-4997-ac0c-15df68bbbecz',
            name: 'Sample App',
            icon: '/images/placeholder_puppy.png',
            author: {
                name: 'Andrew',
                location: 'Portland',
                avatar: '/images/avatar_puppy.png'
            },
            blocks: []
        }
    ];
}

/**
 * Restores the model from localforage.
 *
 * @param  {Function} callback
 *
 * @return {void}
 */
Model.prototype.restore = function (callback) {
    var self = this;

    localforage.getItem(self._ns, function (item) {
        if (item === null) {
            self.observe();
            return callback(null);
        }

        if (typeof item.history !== 'undefined') self.history = item.history;
        if (typeof item.user !== 'undefined') self.user = item.user;
        if (typeof item.apps !== 'undefined') self.apps = item.apps;
        if (typeof item.locale !== 'undefined') self.locale = item.locale;

        self.observe();
        self._logger('Data restored');

        callback(null);
    });
};

/**
 * Saves the current model state to localforage.
 *
 * @param  {Function} callback
 *
 * @return {void}
 */
Model.prototype.save = function (callback) {
    var self = this;
    callback = callback || function (){};

    localforage.setItem(self._ns, {
        history: self.history,
        user: self.user,
        apps: self.apps,
        locale: self.locale,
    }, function (item) {
        if (typeof item !== 'object') return callback('Could not save data');
        self._logger('Data saved');
        callback(null);
    });
};

/**
 * Starts observing ("watch"-ing) for object changes.
 *
 * @return {void}
 */
Model.prototype.observe = function () {
    var self = this;

    watch(self.history, function () {
        self.save(self._logger);
    }, 1);

    watch(self.user, function () {
        self.save(self._logger);
    }, 1);

    watch(self.locale, function () {
        self.save(self._logger);
    }, 1);

    watch(self.apps, function (path) {
        self.save(self._logger);
    }, 10);

    self._ready = true;
};

/**
 * Export
 */
module.exports = new Model();

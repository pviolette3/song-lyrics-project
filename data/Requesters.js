var async = require('async');
var fs = require('fs');
var path = require('path');
var request = require('request');

function HTTPRequester() {}

HTTPRequester.prototype.get = function(url, callback) {
    console.log('REAL GET', url);
    request.get(url, function(err, resp, body) {
        callback(err, body);
    });
}

function RetryingRequester(numRetries, requester) {
    this.requester = requester;
    this.numRetries = numRetries;
}

RetryingRequester.prototype.get = function(url, callback) {
    var fetchUrl = this.requester.get.bind(this.requester, url);
    async.retry(3, fetchUrl, callback);   
};

function RateLimitingRequester(limit, requester) {
    this.limit = limit;
    this.requester = requester;
}

RateLimitingRequester.prototype.get = function(url, callback) {
    this.limit.removeTokens(1, (function() {
            this.requester.get(url, callback);    
        }).bind(this));
}

function CachingRequester(cacheDir, requester) {
    this.cacheDir = cacheDir;
    this.requester = requester || request;
}

CachingRequester.prototype.get = function(url, callback) {
    var localPath = this._getCachePath(url);
    fs.exists(localPath, (function(exists) {
            if (exists) {
                this._sendLocalCopy(localPath, callback);
            } else {
                this._fetchAndSave(url, localPath, callback);
            }
        }).bind(this));
}

CachingRequester.prototype._getCachePath = function(url) {
    return path.join(this.cacheDir, encodeURIComponent(url));
}

CachingRequester.prototype._sendLocalCopy = function(localPath, callback) {
    fs.readFile(localPath, function(err, contents) {
        if (err) {
            callback(new Error('Could not find local copy'), null);
        } else {
            callback(null, contents);
        }
    });
}

CachingRequester.prototype._fetchAndSave = function(url, localPath, callback) {
    this.requester.get(url, function(err, body) {
        if (err) {
            return callback(new Error('Could not get url'),  null);
        }

        fs.writeFile(localPath, body, function(err) {
            if (err) {
                throw err;
            }
            callback(null, body);
        });
    });
}

function ParallelRequester(parallelism, requester) {
    this.requester = requester;
    this.downloadQueue = async.queue(this._processUrl.bind(this), parallelism || 3);
}

ParallelRequester.prototype.get = function(url, callback) {
    this.downloadQueue.push({url: url}, function(err, data) {
        callback(err, data);
    });
}

ParallelRequester.prototype._processUrl = function(task, callback) {
    this.requester.get(task.url, callback);
}

function newParallelCachingRequester(parallelism, cacheDir, limit) {
    var rateLimitedRequester = new RateLimitingRequester(limit, new HTTPRequester());
    var retryer = new RetryingRequester(3, rateLimitedRequester);
    var cachingRequester = new CachingRequester(cacheDir, rateLimitedRequester);
    return new ParallelRequester(parallelism, cachingRequester);
}

module.exports = {
    newParallelCachingRequester: newParallelCachingRequester,
    CachingRequester: CachingRequester,
    RateLimitingRequester: RateLimitingRequester,
    ParallelRequester: ParallelRequester,
};
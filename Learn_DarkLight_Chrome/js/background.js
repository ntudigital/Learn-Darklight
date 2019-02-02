/**
 * Welcome on install
 * @param details
 */
function installWelcome(details) {
    if (details.reason === 'install') {
        chrome.tabs.create({
            'url': chrome.runtime.getURL('/html/options.html?welcome=show')
        });
    }
}

/**
 * Update option
 * @param oldVer
 * @param newVer
 */
function updateOptions(oldVer, newVer) {

    // update storage
    chrome.storage.sync.set({
        OPT_Version: newVer
    });

    // scripts
    // ...

    console.log('Option version updated!');
}

/**
 * Toolbar context menu
 * @param id
 * @param title
 * @param contexts
 * @param onClick
 */
function createToolbarContextMenu(id, title, contexts, onClick) {

    chrome.contextMenus.remove(id, function () {
        chrome.contextMenus.create({
            id: id,
            title: title,
            contexts: contexts
        });
        if (chrome.runtime.lastError) {
        }
    });

    chrome.contextMenus.onClicked.addListener(function (info, tab) {
        if (info.menuItemId == id) {
            if (typeof onClick === 'function')
                onClick();
        }
    });
}

/**
 * IndexedDB for course thumbs
 * @param ready function
 * @param error function
 */
function getDatabase(ready, error) {
    if (!window.indexedDB) {
        alert("Your browser doesn't support IndexedDB. Custom course cover picture is not available.");
        return;
    }
    var dbOpenRequest = window.indexedDB.open("darklight", 1);
    dbOpenRequest.onsuccess = function (e) {
        ready(e.target.result);
    };
    dbOpenRequest.onerror = function (event) {
        console.log(event.target.errorCode);
        if (error) {
            error(event);
        }
    };
    dbOpenRequest.onupgradeneeded = function (event) {
        if (event.oldVersion === 0) {
            var os = event.target.result.createObjectStore('course_thumbs', {keyPath: 'course_id'});
            os.createIndex('course_code', 'course_code', {unique: false});
            os.createIndex('thumb_image', 'thumb_image', {unique: false});
        }
    }
}

function initBackground() {
    /**
     * Background Started
     */
    console.log('Welcome to Learn Darklight!');
    chrome.runtime.onInstalled.addListener(installWelcome);
    chrome.runtime.setUninstallURL("https://www.zijianshao.com/dlight/uninstall/?platform=chrome", function () {
        if (chrome.runtime.lastError) {
        }
    });

    var version = getOptionVersion();
    var configs = getOptionListDefault();
    var options;

    /**
     * Check data updates
     */
    chrome.storage.sync.get(configs, function (items) {
        options = items;

        // option version
        if (options.OPT_Version < version)
            updateOptions(options.OPT_Version, version);

        // extension version
        // if (versionCompare(options.EXT_Version, chrome.app.getDetails().version) < 0)
        //     extensionUpdated(options.EXT_Version, chrome.app.getDetails().version);

    });

    /**
     * Chrome API Calls From Content Scripts
     */
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        // request = {action: '', data: {type:'', content:''}}

        // execute script
        if (request.action == 'executeScript') {

            var obj = {};
            if (Array.isArray(request.data)) {

                for (var i = 0; i < request.data.length; i++) {
                    obj = {};
                    obj[request.data[i].type] = request.data[i].content;
                    chrome.tabs.executeScript(sender.tab.id, obj);
                }

            } else {
                obj[request.data.type] = request.data.content;
                chrome.tabs.executeScript(sender.tab.id, obj);
            }

            if (typeof sendResponse === 'function') sendResponse(obj);

        }

        // inject css
        else if (request.action == 'insertCSS') {

            var obj = {};
            obj[request.data.type] = request.data.content;
            chrome.tabs.insertCSS(sender.tab.id, obj);

            if (typeof sendResponse === 'function') sendResponse(obj);

        }

        // app.getDetails
        else if (request.action == 'getDetails') {

            var obj = chrome.runtime.getManifest();
            if (typeof sendResponse === 'function') sendResponse(obj);

        }

        // open new tab
        else if (request.action == 'createTab') {

            chrome.tabs.create({
                'url': request.data.url
            });

        }

        // get course thumbs
        else if (request.action == 'getCourseThumbs') {

            getDatabase(function (db) {
                var tx = db.transaction(['course_thumbs'], 'readonly');
                var os = tx.objectStore('course_thumbs');
                var all = [];

                os.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        var s = {
                            course_id: cursor.key,
                            course_code: cursor.value.course_code,
                            thumb_image: cursor.value.thumb_image
                        };
                        all.push(s);
                        cursor.continue();
                    } else {
                        try {
                            chrome.tabs.sendMessage(sender.tab.id, {action: 'getCourseThumbsResponse', data: all});
                        } catch (e) {

                        }
                    }
                };
            }, null);
        }

        // get course thumbs one
        else if (request.action == 'getCourseThumbsOne') {

            getDatabase(function (db) {
                var tx = db.transaction(['course_thumbs'], 'readonly');
                var os = tx.objectStore('course_thumbs');
                var req = os.get(request.data.course_id);

                req.onsuccess = function (event) {
                    if (typeof req.result !== typeof undefined) {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            action: 'getCourseThumbsOneResponse',
                            data: [{
                                course_id: req.result.course_id,
                                course_code: req.result.course_code,
                                thumb_image: req.result.thumb_image
                            }]
                        });
                    }
                };
                req.onerror = function (event) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'getCourseThumbsOneResponse',
                        data: {
                            err_code: 2,
                            err_msg: event.target.error.name + ': ' + event.target.error.message
                        }
                    });
                };

            }, null);
        }

        // add course thumbs
        else if (request.action == 'addCourseThumbs') {

            getDatabase(function (db) {
                var tx = db.transaction(['course_thumbs'], 'readwrite');
                var os = tx.objectStore('course_thumbs');

                // test existence
                var req1 = os.get(request.data.course_id);
                req1.onsuccess = function (event) {

                    if (req1.result) {

                        // found in db
                        var conf = confirm("This course ID already exists. Do you want to update the existing record?");
                        if (conf) {
                            // update
                            var req = os.put({
                                course_id: request.data.course_id,
                                course_code: request.data.course_code,
                                thumb_image: request.data.thumb_image
                            });
                            req.onsuccess = function (event) {
                                chrome.tabs.sendMessage(sender.tab.id, {
                                    action: 'addCourseThumbsResponse',
                                    data: {
                                        err_code: 0,
                                        data: {
                                            msg: 'Custom Cover Picture Updated',
                                            popup_class: request.data.popup_class
                                        }
                                    }
                                });
                            };
                            req.onerror = function (event) {
                                chrome.tabs.sendMessage(sender.tab.id, {
                                    action: 'addCourseThumbsResponse',
                                    data: {
                                        err_code: 2,
                                        err_msg: event.target.error.name + ': ' + event.target.error.message
                                    }
                                });
                            };

                        } else {
                            // give up replace
                            chrome.tabs.sendMessage(sender.tab.id, {
                                action: 'addCourseThumbsResponse',
                                // data: {
                                //     err_code: 1,
                                //     err_msg: 'Operation canceled. The existing record was not affected.'
                                // }
                                data: {
                                    err_code: 0,
                                    data: {
                                        msg: 'Operation canceled. The existing record was not affected.',
                                        popup_class: request.data.popup_class
                                    }
                                }
                            });
                        }

                    }

                    else {
                        // add to db
                        var req = os.add({
                            course_id: request.data.course_id,
                            course_code: request.data.course_code,
                            thumb_image: request.data.thumb_image
                        });
                        req.onsuccess = function (event) {
                            chrome.tabs.sendMessage(sender.tab.id, {
                                action: 'addCourseThumbsResponse',
                                data: {
                                    err_code: 0,
                                    data: {
                                        msg: 'New Custom Cover Picture Added',
                                        popup_class: request.data.popup_class
                                    }
                                }
                            });
                        };
                        req.onerror = function (event) {
                            chrome.tabs.sendMessage(sender.tab.id, {
                                action: 'addCourseThumbsResponse',
                                data: {
                                    err_code: 2,
                                    err_msg: event.target.error.name + ': ' + event.target.error.message
                                }
                            });
                        };

                    }

                };
            }, null);
        }

        // delete course thumbs
        else if (request.action == 'deleteCourseThumbs') {

            getDatabase(function (db) {
                var tx = db.transaction(['course_thumbs'], 'readwrite');
                var os = tx.objectStore('course_thumbs');
                var req = os.delete(request.data.course_id);

                req.onsuccess = function (event) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'deleteCourseThumbsResponse',
                        data: {
                            err_code: 0,
                            data: {
                                msg: 'Custom cover picture deleted successfully'
                            }
                        }
                    });
                };
                req.onerror = function (event) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'deleteCourseThumbsResponse',
                        data: {
                            err_code: 2,
                            err_msg: event.target.error.name + ': ' + event.target.error.message
                        }
                    });
                };
            }, null);
        }

    });

    /**
     * Add toolbar context menu
     */
    createToolbarContextMenu('dlight-website', 'Official Website', ['browser_action'], function () {
        chrome.tabs.create({
            'url': 'https://www.zijianshao.com/dlight/'
        });
    });
    createToolbarContextMenu('dlight-contribute', 'Donate', ['browser_action'], function () {
        chrome.tabs.create({
            'url': 'https://www.paypal.me/zjshao'
        });
    });
    createToolbarContextMenu('dlight-github', 'GitHub', ['browser_action'], function () {
        chrome.tabs.create({
            'url': 'https://github.com/SssWind/Learn-Darklight'
        });
    });

}

initBackground();

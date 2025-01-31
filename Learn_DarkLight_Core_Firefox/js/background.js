/**
 * Update option
 * @param oldVer
 * @param newVer
 */
function updateOptions(oldVer, newVer) {

    // update storage
    browser.storage.sync.set({
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

    browser.contextMenus.remove(id, function () {
        browser.contextMenus.create({
            id: id,
            title: title,
            contexts: contexts
        });
        if (browser.runtime.lastError) {
        }
    });

    browser.contextMenus.onClicked.addListener(function (info, tab) {
        if (info.menuItemId == id) {
            if (typeof onClick === 'function')
                onClick();
        }
    });
}

function initBackground() {
    /**
     * Background Started
     */
    console.log('Welcome to Learn Darklight Core!');
    browser.runtime.setUninstallURL("https://www.zijianshao.com/dlight/uninstall/?platform=firefox", function () {
        if (browser.runtime.lastError) {
        }
    });

    var version = getOptionVersion();
    var configs = getOptionListDefault();
    var options;

    /**
     * Check data updates
     */
    browser.storage.sync.get(configs, function (items) {
        options = items;

        // option version
        if (options.OPT_Version < version)
            updateOptions(options.OPT_Version, version);

        // extension version
        // if (versionCompare(options.EXT_Version, browser.app.getDetails().version) < 0)
        //     extensionUpdated(options.EXT_Version, browser.app.getDetails().version);

    });

    /**
     * Chrome API Calls From Content Scripts
     */
    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        // request = {action: '', data: {type:'', content:''}}

        // execute script
        if (request.action == 'executeScript') {

            var obj = {};
            if (Array.isArray(request.data)) {

                for (var i = 0; i < request.data.length; i++) {
                    obj = {};
                    obj[request.data[i].type] = request.data[i].content;
                    browser.tabs.executeScript(sender.tab.id, obj);
                }

            } else {
                obj[request.data.type] = request.data.content;
                browser.tabs.executeScript(sender.tab.id, obj);
            }

            if (typeof sendResponse === 'function') sendResponse(obj);

        }

        // inject css
        else if (request.action == 'insertCSS') {

            var obj = {};
            obj[request.data.type] = request.data.content;
            browser.tabs.insertCSS(sender.tab.id, obj);

            if (typeof sendResponse === 'function') sendResponse(obj);

        }

        // app.getDetails
        else if (request.action == 'getDetails') {

            var obj = browser.runtime.getManifest();
            if (typeof sendResponse === 'function') sendResponse(obj);

        }

        // open new tab
        else if (request.action == 'createTab') {

            browser.tabs.create({
                'url': request.data.url
            });

        }

    });

    /**
     * Add toolbar context menu
     */
    createToolbarContextMenu('dlight-website', 'Official Website', ['browser_action'], function () {
        browser.tabs.create({
            'url': 'https://www.zijianshao.com/dlight/'
        });
    });
    createToolbarContextMenu('dlight-contribute', 'Donate', ['browser_action'], function () {
        browser.tabs.create({
            'url': 'https://www.paypal.me/zjshao'
        });
    });
    createToolbarContextMenu('dlight-github', 'GitHub', ['browser_action'], function () {
        browser.tabs.create({
            'url': 'https://github.com/SssWind/Learn-Darklight'
        });
    });

}

initBackground();

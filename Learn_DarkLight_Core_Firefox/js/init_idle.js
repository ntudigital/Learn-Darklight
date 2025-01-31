$.fn.sRoot = function () {
    // require jquery object
    if (!this instanceof jQuery) {
        console.log('sRoot requires jQuery object.');
        return this;
    }
    return $(this[0].shadowRoot);
};

function detectExtConflict() {

    if ($('#darklight-extension').length) {
        alert("You have multiple versions of Learn Darklight installed. Please disable one of them to avoid unexpected behaviors.");
    } else {
        $('<div id="darklight-extension"></div>').appendTo('body');
    }

}

function removeOverlay(forcible) {
    // if (currURL2.match(/\/d2l\/home$/)) {
    //     $('#darklight-load-overlay').delay(300).fadeOut(300, function () {
    //         $(this).remove();
    //     });
    // } else {
    //     setTimeout(function () {
    //         $('#darklight-load-overlay').on('webkitTransitionEnd transitionend', function (e) {
    //             $(this).remove();
    //         }).addClass('darklight-load-overlay-hide');
    //     }, 300);
    // }

    if (forcible === true) {
        $('.darklight-load-overlay').remove();
    } else {
        setTimeout(function () {
            $('#darklight-load-overlay').on('webkitTransitionEnd transitionend', function (e) {
                $(this).remove();
            }).addClass('darklight-load-overlay-hide');
        }, 300);
    }
}

function addBackToTopButton() {
    function _addBackToTopButton() {
        if ($(window).scrollTop() < 100)
            $('#darklight-back-to-top').addClass('darklight-back-to-top-hidden').delay(200);
        else
            $('#darklight-back-to-top').removeClass('darklight-back-to-top-hidden');
    }

    $('<div class="darklight-back-to-top darklight-back-to-top-hidden" id="darklight-back-to-top"><i class="arrow up"></i></div>').on('click', function (e) {
        e.preventDefault();
        scrollToUtil(0, 300);
    }).appendTo('body');

    _addBackToTopButton();
    $(window).on('scroll', function () {
        _addBackToTopButton();
    });
}


function fixNavigation() {
    function _fixNavigation() {

        if ($(window).width() < 768)
            return;

        var html = null;
        if (isBrowser('safari'))
            html = $('body');
        else
            html = $('html');

        if (html.scrollTop() < offset) {
            // is on screen
            nav.removeClass('darklight-navbar-fixed');
            header.css('margin-bottom', '0px');
        } else {
            // not on screen
            nav.addClass('darklight-navbar-fixed');
            header.css('margin-bottom', navHeight + 'px');
        }
    }

    var nav = $('d2l-navigation-main-footer');
    var navHeight = nav.outerHeight();
    // var header = $('.d2l-navigation-s-header');
    var header = $('d2l-navigation-main-header');
    var offset = header.outerHeight();

    if (isBrowser('firefox')) {
        $(window).on('load', function () {
            navHeight = nav.outerHeight();
            offset = header.outerHeight();
            _fixNavigation();
        });
    } else {
        _fixNavigation();
    }

    $(window).on('scroll', function () {
        _fixNavigation();
    });

    $(window).on('resize', function () {
        if ($(window).width() < 768) {
            header.css('margin-bottom', '0px');
        } else {
            navHeight = nav.outerHeight();
            offset = header.outerHeight();
            _fixNavigation();
        }
    });
}


function listMembersBtn() {

    var theForm = $('form[id="d2l_form"][action^="user_available_group_list.d2l"]');
    if (theForm.find('table').first().text().match(/No items found/g))
        return;

    $('table.d_g.d_gn').removeClass('d_g d_gn').addClass('d2l-table d2l-grid d_gl group-list');
    injectCSS('.group-list th, .group-list td {border-width: 1px; border-style: solid; padding: 5px 15px;}', 'head', 'text');

    var targetBtn = $('button[class="d2l-button"][data-location^="user_group_list.d2l"]');
    if (!targetBtn.length) return;

    var newBtn = $('<button class="d2l-button" id="darklight-all-group-members-btn">Display Group Members</button>');
    newBtn.insertAfter(targetBtn);

    newBtn.on('click', function (e) {
        e.preventDefault();

        if ($('#darklight-all-group-members').length || $('#darklight-all-group-members-btn').attr('data-shown') == '1') {
            alert('All group members have already been listed. Please refresh page if you want to try again.');
            return;
        }

        blockPage();

        var groupID = [];
        var groupNum = [];

        theForm.find('table tbody tr').each(function (i, elem) {

            var lastTDLink = $(elem).find('td:last-child a.d2l-link');
            var lastTD2Link = $(elem).find('td:nth-last-child(2) a.d2l-link');

            if ((lastTD2Link.length && lastTDLink.length && lastTDLink.text().match(/Join Group/gi))
                || (lastTD2Link.length && lastTD2Link.text().match(/\(Full\)/gi))) {
                var theID = lastTD2Link.attr('onclick').match(/\d+/g).join('');
                $(elem).attr('data-group-id', theID);
                groupID.push(theID);
                groupNum.push($(elem).find('td:first-child').text().trim());
            }

        });

        // ajax requests
        var finalList = {};
        var counter = 0;
        var url = new URL(currURL);
        var ou = url.searchParams.get('ou');

        function _showAllGroupMembers() {

            theForm.find('table tbody tr').each(function (idx, elem) {
                var trID = $(elem).attr('data-group-id');
                if (typeof trID !== typeof undefined) {
                    $(elem).find('td:nth-last-child(2)').html(finalList['ID_' + trID].names);
                }
            });

            $('#darklight-all-group-members-btn').attr('data-shown', '1');
        }

        function _getGroupMemberAjax() {

            if (!groupID.length) {
                unblockPage();
                return;
            }

            blockPageMsg('Retrieving data - ' + groupNum[counter]);
            $.get('/d2l/lms/group/group_member_list.d2l?ou=' + ou + '&groupId=' + groupID[counter] + '&d2l_body_type=2', function (data) {
                var html = $($.parseHTML(data));
                var table = html.find('.d2l-grid-container .d2l-table.d2l-grid');
                var names = [];
                table.find('tr').each(function (idx, elem) {
                    if (idx > 0) {
                        var name = $(elem).text().trim();
                        names.push(name);
                    }
                });
                names = names.join('<br>');
                finalList['ID_' + groupID[counter]] = {
                    'group': groupNum[counter],
                    'names': names
                };
                counter++;
                if (counter >= groupID.length) {
                    blockPageMsg('Done');
                    unblockPage();
                    _showAllGroupMembers();
                } else {
                    // wait 100ms till next request (don't wanna blow up the server)
                    // setTimeout(_getGroupMemberAjax,100);

                    // whatever
                    _getGroupMemberAjax();
                }
            });
        }

        _getGroupMemberAjax();

    });
}


function homepageFunc() {

    $('.d2l-homepage-header-wrapper').each(function (i, e) {
        var headSelf = $(e), headText = headSelf.text();
        if (headText.match(/SYSTEM ALERT/) || headText.match(/News/)) {
            if (!isWLU()) {
                // remove sys alert if empty
                var alertHtmlDom = headSelf.closest('.d2l-widget').find('.d2l-widget-content .d2l-htmlblock').first();
                var _alertHtml = alertHtmlDom.clone();
                _alertHtml.find('a').remove();
                _alertHtml.find('script').remove();
                if (_alertHtml.text().trim() === '') {
                    headSelf.closest('.d2l-widget').addClass('hidden');
                }
            } else {
                // remove news if empty
                var _content = headSelf.closest('.d2l-widget').find('.d2l-widget-content');
                if (_content.find('.d2l-msg-container').length && _content.find('.d2l-msg-container').text().match(/There are no/)) {
                    headSelf.closest('.d2l-widget').addClass('hidden');
                }
            }
        } else if (headText.match(/Check My System/) && !isWLU()) {
            headSelf.parents('div.d2l-widget').remove();
        } else if (headText.match(/Calendar/) && isWLU()) {
            // for WLU homepage calendar
            headSelf.parents('div.d2l-widget').addClass('darklight-course-home-calendar');
        }
    });

    // remove homepage privacy notice
    var heading = $('.homepage-col-12 .d2l-heading');
    heading.each(function () {
        if ($(this).text().match(/Privacy/)) {
            $(this).parents('div.homepage-col-12').remove();
        }
    });

}

function initDarklightFunc(){
    // display group members
    if (currURL.match(/\/d2l\/lms\/group\/user_available_group_list\.d2l/g)) {
        listMembersBtn();
    }

    // homepage
    if (currURL.match(/\/d2l\/home$/)) {
        homepageFunc();
    }

    $('d2l-dropdown').on('click', function () {
        var self = $(this);
        if (self.data('dropdown-init') !== 'true') {
            self.data('dropdown-init', 'true');
            injectCSSShadow(baseURL + 'css/shadow_dropdown.css', self, 'file', true);
        } else if (typeof self.children('d2l-dropdown-menu').attr('render-content') === typeof undefined) {
            injectCSSShadow(baseURL + 'css/shadow_dropdown.css', self.children('d2l-dropdown-menu'), 'file', true);
        }
    });

    initTheme();

    removeOverlay();

    setTimeout(function () {
        removeOverlay(true);
    }, 3000);
}

function initDarklightIdle() {

    if (currURL.includes('/content/enforced/'))
        return;

    // favicon
    var head = $('head');
    head.find('link[rel="icon"]').remove();
    head.append($('<link rel="icon" type="image/png" href="' + baseURL + 'icon/icon32.png' + '">'));

    // conflict detect
    detectExtConflict();

    // back to top button
    addBackToTopButton();

    // fix navigation
    fixNavigation();

    if (!document.hidden) {

        initDarklightIdle.initialized = true;
        setTimeout(function () {
            initDarklightFunc();
        }, 50);

    } else {

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden && initDarklightIdle.initialized !== true) {
                initDarklightIdle.initialized = true;
                setTimeout(function () {
                    initDarklightFunc();
                }, 50);
            }
        }, false);

    }

}

// if (document.hasFocus()) {
//     initDarklightIdle();
// } else {
//     var focusInterval = setInterval(function () {
//         if (document.hasFocus()) {
//             clearInterval(focusInterval);
//             setTimeout(function () {
//                 initDarklightIdle();
//             }, 100);
//         }
//     }, 300);
// }

if (initReady) {
    initDarklightIdle();
} else {
    var initIntvCnt = 0;
    var initIntv = setInterval(function () {
        if (initReady) {
            clearInterval(initIntv);
            initDarklightIdle();
        } else {
            initIntvCnt++;
            if (initIntvCnt > 50) {
                clearInterval(initIntv);
                removeOverlay(true);
            }
        }
    }, 100);
}

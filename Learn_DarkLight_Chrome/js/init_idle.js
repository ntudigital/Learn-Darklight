$.fn.uwCalendar = function (action, data) {
    // e.g. $('<div/>').uwCalendar('init');

    // param
    if (typeof action === typeof undefined) action = 'init';

    // require jquery object
    if (!this instanceof jQuery) {
        console.log('uwCalendar requires jQuery object.');
        return this;
    }
    // require div tag
    else if (this.prop('tagName').toLowerCase() !== 'div') {
        console.log('uwCalendar requires div tag.');
        return this;
    }
    // require init first
    else if (action !== 'init' && !this.hasClass('darklight-homepage-calendar-widget')) {
        console.log('uwCalendar has not been initialized.');
        return this;
    }

    // init calendar widget
    if (action == 'init') {
        this.attr({
            id: 'darklight-homepage-calendar-widget',
            role: 'region',
            class: 'd2l-widget darklight-homepage-calendar-widget d2l-tile'
        });
        this.html('<div class="d2l-widget-header"><div class="d2l-homepage-header-wrapper"><h2 class="d2l-heading vui-heading-4">Upcoming Events</h2></div></div>' +
            '<div class="d2l-widget-content darklight-homepage-calendar" id="darklight-homepage-calendar"></div>' +
            '<div class="darklight-homepage-calendar-saved hidden" hidden></div>');
    }

    // loading
    else if (action == 'loading') {
        this.find('.darklight-homepage-calendar')
            .html('<div class="darklight-homepage-calendar-loading">' +
                '<div class="darklight-block-page-loader"></div>' +
                '<div class="darklight-homepage-calendar-loading-msg">Loading calendar (0%)</div></div>');
    }

    // loading msg
    else if (action == 'loadingMsg') {
        this.find('.darklight-homepage-calendar-loading-msg').html(data);
    }

    // list empty
    else if (action == 'empty') {
        this.find('.darklight-homepage-calendar')
            .html('<div class="d2l-msg-container d2l-datalist-empty"><div class="d2l-msg-container-inner"><div class="d2l-msg-container-text">There are no events to display.</div><div class="d2l-clear"></div></div></div>');
    }

    // show saved
    else if (action == 'switchTo') {
        var savedCal = this.find('.darklight-homepage-calendar-saved').children('div[data-panel="' + data.id + '"]');
        if (savedCal.length) {
            this.find('.darklight-homepage-calendar').html('').append(savedCal.clone());
        } else {
            console.log('No saved calendar with input panel ID ' + data.id);
            this.uwCalendar('empty');
            return this;
        }
    }

    // new list
    else if (action == 'new') {
        // data = {id: panelID, list: array}
        if (typeof data === typeof undefined) {
            console.log('uwCalendar new requires data parameter.');
            return this;
        }

        var weekdayTxt = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var monthTxt = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        var todayTag = '', dateElem = '', dateCls = '', weekdayElem = '';
        var today = new Date();
        var targetDay = null;
        var appendText = '';

        for (var i = 0, len = data.list.length; i < len; i++) {

            targetDay = new Date(data.list[i].timestamp * 1000);
            if (targetDay.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)) {
                todayTag = '<div class="tag">TODAY</div>';
            } else {
                todayTag = '';
            }

            if (options.HOME_ShowWeekDayOnCalendar) {
                dateCls = ' darklight-homepage-calendar-date-ani';
                weekdayElem = '<span class="weekday">' + weekdayTxt[data.list[i].weekDay].substring(0, 3).toUpperCase() + '</span>';
            } else {
                dateCls = '';
                weekdayElem = '';
            }

            dateElem = '<div class="darklight-homepage-calendar-date' + dateCls + '" title="' +
                weekdayTxt[data.list[i].weekDay] + ', ' + monthTxt[data.list[i].month] + ' ' + data.list[i].day + ', ' + data.list[i].year + '">' +
                '<span class="month">' + monthTxt[data.list[i].month].substring(0, 3).toUpperCase() + '</span>' +
                '<span class="day">' + data.list[i].day + '</span>' +
                weekdayElem +
                '</div>';

            appendText += '<a href="' + data.list[i].link + '" target="_blank" class="darklight-homepage-calendar-item">' +
                dateElem +
                '<div class="darklight-homepage-calendar-content">' +
                todayTag +
                '<div><span class="time">' + data.list[i].time + '</span>' +
                '<span class="course">' + data.list[i].course + '</span></div>' +
                '<div class="title d2l-typography">' + data.list[i].title + '</div></div></a>';
        }

        // show
        appendText = '<div data-panel="' + data.id + '">' + appendText + '</div>';
        this.find('.darklight-homepage-calendar').html(appendText);

        // save
        var savedList = this.find('.darklight-homepage-calendar-saved');
        savedList.children('div[data-panel="' + data.id + '"]').remove();
        savedList.append(appendText);
    }
    return this;
};

function injectCSS(url, tag, type) {

    var style;

    if (type === 'text') {

        style = $('<style/>');

        style.text(url);

    } else {

        style = $('<link/>', {
            'rel': 'stylesheet',
            'type': 'text/css',
            'href': url
        });

    }

    $(tag).append(style);

}

function injectJS(url, tag, type) {

    var script = $('<script/>', {
        'type': 'text/javascript'
    });

    if (type === 'text') {
        script.text(url);
    } else {
        script.attr('src', url);
    }

    $(tag).append(script);

}

function scrollToUtil(pos, time, offset) {

    if ($.type(offset) !== 'number')
        offset = 0;

    if ($.type(pos) === 'object')
        pos = pos.offset().top;
    else if ($.type(pos) === 'string')
        pos = $(pos).first().offset().top;

    html.animate({scrollTop: pos - offset}, time);

}

function blockPage(color, msg, time) {
    if ($('#darklight-block-page').length)
        return;

    if (time === undefined || !Number.isInteger(time) || time == null || time === false)
        time = 300;

    var elem = $('<div/>', {
        'id': 'darklight-block-page',
        'class': 'darklight-block-page'
    });

    if (color !== undefined && color !== '')
        elem.css('background-color', color);
    if (msg === undefined)
        msg = 'Loading';

    elem.append($('<div class="darklight-block-page-wrapper">' +
        '<div class="darklight-block-page-loader"></div>' +
        '<div class="darklight-block-page-message">' + msg + '</div>' +
        '</div>')).hide().appendTo(body).fadeIn(time);

}

function blockPageMsg(msg) {
    $('#darklight-block-page').find('.darklight-block-page-message').text(msg);
}

function unblockPage(time) {

    if (time === undefined || !Number.isInteger(time) || time == null || time === false)
        time = 300;

    $('#darklight-block-page').fadeOut(time, function () {
        $(this).remove();
    });

}

function isOnScreen(element) {

    if ($.type(element) === 'object')
        return (window.scrollY < element.offset().top);
    else if ($.type(element) === 'number')
        return (window.scrollY < element);

    return true;
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
        }, 100);
    }
}

function detectExtConflict() {

    if ($('#darklight-extension').length) {
        alert("You have multiple versions of Learn Darklight installed. Please disable one of them to avoid unexpected behaviors.");
    } else {
        $('<div id="darklight-extension"></div>').appendTo(body);
    }

}

function customFont() {

    var fontConf = options.GLB_CustomFontInfo.split('||');

    if (fontConf[0].match(/Default/i) || fontConf[0].match(/^Lato$/i)) return;

    // fontName||weights||fontSize||source
    if (fontConf.length == 4) {

        // name, weights, size, source
        if (fontConf[3] == 'google') {
            injectCSS('//fonts.googleapis.com/css?family=' + fontConf[0].replace(/ /g, '+') + ':' + fontConf[1], 'head');
        } else if (fontConf[3] == 'none') {

        } else {
            injectCSS('//fonts.googleapis.com/css?family=' + fontConf[0].replace(/ /g, '+') + ':' + fontConf[1], 'head');
        }

    } else if (fontConf.length == 3) {

        // name, weights, size
        injectCSS('//fonts.googleapis.com/css?family=' + fontConf[0].replace(/ /g, '+') + ':' + fontConf[1], 'head');

    } else {

        // name only
        injectCSS('//fonts.googleapis.com/css?family=' + fontConf[0].replace(/ /g, '+') + ':200,400,600,800', 'head');

    }

    var fontCssText = 'body, strong, p, a, h1, h2, h3, h4, h5, h6, input, button, select, div {font-family: "'
        + fontConf[0] + '", "Microsoft YaHei", sans-serif!important;}';
    chrome.runtime.sendMessage({
        action: 'insertCSS',
        data: {code: fontCssText}
    });
}

function addBackToTopButton() {
    function _addBackToTopButton() {
        if (window.scrollY < 100)
            btn.addClass('darklight-back-to-top-hidden');
        else
            btn.removeClass('darklight-back-to-top-hidden');
    }

    var btn = $('<div/>', {
        id: 'darklight-back-to-top',
        class: 'darklight-back-to-top darklight-back-to-top-hidden'
    });
    btn.append('<i class="arrow up"></i>');
    btn.on('click', function (e) {
        e.preventDefault();
        scrollToUtil(0, 300);
    });
    btn.appendTo(body);

    _addBackToTopButton();
    $(window).on('scroll', function () {
        _addBackToTopButton();
    });
}

function addBackToTopButtonNavbar() {

    function _addBackToTopButton() {
        if (window.scrollY < 100)
            btn.addClass('darklight-navbar-back-to-top-hidden');
        else
            btn.removeClass('darklight-navbar-back-to-top-hidden');
    }

    var navWrapper = undefined;
    var btn = $('<div/>', {
        id: 'darklight-navbar-back-to-top',
        class: 'darklight-navbar-back-to-top'
    });
    btn.append('<a href="#"><i class="arrow up"></i></a>');
    btn.on('click', function (e) {
        e.preventDefault();
        scrollToUtil(0, 300);
    });

    var intervalCnt = 0;
    var interval = setInterval(function () {
        if (typeof navWrapper === typeof undefined || !navWrapper.length) {
            navWrapper = $('d2l-navigation d2l-navigation-main-footer .d2l-navigation-centerer .d2l-navigation-gutters .d2l-navigation-s-main-wrapper');
        } else {
            clearInterval(interval);
            btn.appendTo(navWrapper);
            _addBackToTopButton();
        }
        intervalCnt++;
        if (intervalCnt > 10) {
            clearInterval(interval);
        }
    }, 800);

    $(window).on('scroll', function () {
        _addBackToTopButton();
    });
}

function fixNavigation() {
    function _fixNavigation() {

        if (windowW < 768) return;

        if (window.scrollY < headerH) {
            // is on screen
            footer.removeClass('darklight-navbar-fixed');
            d2lnav.css('padding-bottom', '0px');
        } else {
            // not on screen
            footer.addClass('darklight-navbar-fixed');
            d2lnav.css('padding-bottom', footerH + 'px');
        }
    }

    function _initVars() {
        footerH = footer.outerHeight();
        headerH = header.outerHeight() + header.offset().top;
        d2lnavH = d2lnav.outerHeight();
        windowW = window.innerWidth;
    }

    var footer = $('d2l-navigation-main-footer');
    var header = $('d2l-navigation-main-header');
    var d2lnav = $('d2l-navigation');
    if (!footer.length || !header.length || !d2lnav.length) return;

    var footerH, headerH, d2lnavH, windowW;
    _initVars();
    _fixNavigation();

    setTimeout(function () {
        _initVars();
    }, 2000);

    $(window).on('load', function () {
        _initVars();
        _fixNavigation();
    }).on('scroll', function () {
        _fixNavigation();
    }).on('resize', function () {
        _initVars();
        if (window.innerWidth < 768) {
            d2lnav.css('padding-bottom', '0px');
        } else {
            _fixNavigation();
        }
    });
}

function fixNavigationSticky() {

    function _testIsOnScr() {
        if (window.scrollY < offset) {
            // is on screen
            pageHeader.removeClass('darklight-navbar-sticky-on');
        } else {
            // not on screen
            pageHeader.addClass('darklight-navbar-sticky-on');
        }
    }

    var header = $('d2l-navigation-main-header');
    var footer = $('d2l-navigation-main-footer');
    if (!header.length || !footer.length) return;

    var offset = themeConfigs.headerHeight;
    var pageHeader = footer.closest('header');

    pageHeader.addClass('darklight-navbar-sticky');
    pageHeader.css('top', '-' + offset + 'px');

    $(window).on('load scroll', _testIsOnScr);
}

function quizPageFunc() {

    function _getFloatButton(iconSrc, text, id) {
        if (typeof id === typeof undefined) id = '';
        else id = ' id="' + id + '"';
        return '<a href="#" class="darklight-fixed-right-button"' + id + '><div class="darklight-fixed-right-button-icon"><img src="' + iconSrc + '"></div><div class="darklight-fixed-right-button-text">' + text + '</div></a>';
    }

    function _pageFunc() {

        var wrapper = $('<div class="darklight-fixed-right-wrapper"></div>');
        wrapper.appendTo(body);

        var sizeStep = 200;

        // inc iframe
        var sizeInc = $(_getFloatButton(baseURL + 'img/button-icon-plus.png', 'Content Height <strong>+</strong>'));
        sizeInc.on('click', function (e) {
            e.preventDefault();
            var currH = iframe.attr('data-current-height');
            if (typeof currH === 'undefined')
                currH = iframe.height();
            currH = parseInt(currH);
            currH += sizeStep;
            iframe.css('height', currH + 'px');
            iframe.attr('data-current-height', currH);
        });
        sizeInc.appendTo(wrapper);

        // dec iframe
        var sizeDec = $(_getFloatButton(baseURL + 'img/button-icon-minus.png', 'Content Height <strong>-</strong>'));
        sizeDec.on('click', function (e) {
            e.preventDefault();
            var currH = iframe.attr('data-current-height');
            if (typeof currH === 'undefined')
                currH = iframe.height();
            currH = parseInt(currH);
            if (currH >= 300) {
                currH -= sizeStep;
                iframe.css('height', currH + 'px');
                iframe.attr('data-current-height', currH);
            }
        });
        sizeDec.appendTo(wrapper);

        $(window).on('resize', function () {
            setTimeout(function () {
                if (typeof iframe.attr('data-current-height') !== typeof undefined)
                    iframe.css('height', iframe.attr('data-current-height') + 'px');
            }, 10);
        });

        // unlock body
        function _unlockBody() {
            if (body.css('overflow') == 'hidden') {
                var unlockScroll = $(_getFloatButton(baseURL + 'img/button-icon-unlock.png', 'Unlock Page Scroll'));
                unlockScroll.on('click', function (e) {
                    e.preventDefault();
                    body.css('overflow', 'auto');
                    $(this).remove();
                });
                unlockScroll.appendTo(wrapper);
            }
        }

        setTimeout(_unlockBody, 2000);
    }

    if (!options.QUIZ_ContentResizeBtn) return;

    var iframe = null;
    var getIframeCounter = 0;

    var interval = setInterval(function () {
        iframe = $('.d2l-page-main').find('iframe');
        iframe.each(function (idx, elem) {
            if ($(elem).attr('src').trim() != '') {
                iframe = $(elem);
                clearInterval(interval);
                _pageFunc();
                return false;
            }
        });
        getIframeCounter++;
        if (getIframeCounter > 20) {
            clearInterval(interval);
        }
    }, 300);

}

function contentPageFunc() {

    function _getFloatButton(iconSrc, text, id) {
        if (typeof id === typeof undefined) id = '';
        else id = ' id="' + id + '"';
        return '<a href="#" class="darklight-fixed-right-button"' + id + '><div class="darklight-fixed-right-button-icon"><img src="' + iconSrc + '"></div><div class="darklight-fixed-right-button-text">' + text + '</div></a>';
    }

    function _pageFunc() {

        var wrapper = $('<div class="darklight-fixed-right-wrapper"></div>');
        wrapper.appendTo(body);

        var sizeStep = 50;

        // inc iframe
        if (options.COURSE_ContentResizeBtn) {
            var sizeInc = $(_getFloatButton(baseURL + 'img/button-icon-plus.png', 'Content Height <strong>+</strong>'));
            sizeInc.on('click', function (e) {
                e.preventDefault();
                var currH = iframe.attr('data-current-height');
                if (typeof currH === 'undefined')
                    currH = iframe.height();
                currH = parseInt(currH);
                currH += sizeStep;
                iframe.css('height', currH + 'px');
                iframe.attr('data-current-height', currH);
            });
            sizeInc.appendTo(wrapper);
        }

        // dec iframe
        if (options.COURSE_ContentResizeBtn) {
            var sizeDec = $(_getFloatButton(baseURL + 'img/button-icon-minus.png', 'Content Height <strong>-</strong>'));
            sizeDec.on('click', function (e) {
                e.preventDefault();
                var currH = iframe.attr('data-current-height');
                if (typeof currH === 'undefined')
                    currH = iframe.height();
                currH = parseInt(currH);
                if (currH >= 300) {
                    currH -= sizeStep;
                    iframe.css('height', currH + 'px');
                    iframe.attr('data-current-height', currH);
                }
            });
            sizeDec.appendTo(wrapper);
        }

        // full height
        // if (options.COURSE_ContentResizeBtn && iframe.hasClass('d2l-iframe-fit-user-content')) {
        //     // skip if cross domain
        //     if (extractHostname(iframe.attr('src')) == window.location.hostname) {
        //         var sizeFull = $(_getFloatButton(baseURL + 'img/button-icon-arrows-alt-v.png', 'Full height (beta)'));
        //         sizeFull.on('click', function (e) {
        //             e.preventDefault();
        //             iframe.css('height', iframe.contents().height() + 'px');
        //             iframe.attr('data-full-height', 'true');
        //             $(this).hide();
        //         });
        //         sizeFull.appendTo(wrapper);
        //     }
        // }

        $(window).on('resize', function () {
            setTimeout(function () {
                if (typeof iframe.attr('data-full-height') !== typeof undefined) {
                    // sizeFull.trigger('click');
                } else if (typeof iframe.attr('data-current-height') !== typeof undefined) {
                    iframe.css('height', iframe.attr('data-current-height') + 'px');
                }
            }, 10);
        });

        function _fullScreenBtn() {
            var fullScreenBtn = iframe.contents().find('#fullscreenMode');
            if (fullScreenBtn.length && !$('#darklight-full-screen-mode').length) {

                // test is pdf or ppt
                var isPDF = false;
                if (iframe.closest('div.d2l-fileviewer').children('div.d2l-fileviewer-pdf-pdfjs').length)
                    isPDF = true;

                // org full scr btn
                fullScreenBtn.on('click', function () {
                    if (isPDF) {
                        setTimeout(function () {
                            if (!iframe.hasClass('d2l-fileviewer-rendered-pdf-dialog')) {
                                // fix for sticky navbar
                                body.css('overflow', '');
                                html.css('overflow', '');
                            }
                        }, 10);
                    }
                });

                // sidebar full scr btn
                var fullScr = $(_getFloatButton(
                    baseURL + 'img/button-icon-expand.png',
                    'Full Screen Mode',
                    'darklight-full-screen-mode')
                );
                fullScr.on('click', function (e) {
                    e.preventDefault();
                    fullScreenBtn.trigger('click');
                });
                if (options.COURSE_ContentResizeBtn)
                    fullScr.appendTo(wrapper);

                // scroll to content
                if (options.COURSE_AutoScrollToContent && window.innerWidth >= 768) {
                    var currH = 0;
                    if (options.GLB_FixNavigation) {
                        scrollToUtil(iframe, 0, $('d2l-navigation-main-footer').height());
                        currH = parseInt(window.innerHeight - $('d2l-navigation-main-footer').height());
                    } else {
                        currH = parseInt(window.innerHeight);
                    }
                    iframe.css('height', currH + 'px');
                }

                if (options.COURSE_AutoEnterFullScreen) {
                    fullScreenBtn.trigger('click');
                }

                clearInterval(fullSrcInterval);

            }
            fullSrcCounter++;
            if (fullSrcCounter > 10) {
                clearInterval(fullSrcInterval);
            }
        }

        var fullSrcInterval = null;
        var fullSrcCounter = 0;
        if (iframe.hasClass('d2l-fileviewer-rendered-pdf')) {
            fullSrcInterval = setInterval(function () {
                _fullScreenBtn();
            }, 1000);
        }

        // unlock body
        function _unlockBody() {
            if (body.css('overflow') == 'hidden') {
                var unlockScroll = $(_getFloatButton(baseURL + 'img/button-icon-unlock.png', 'Unlock Page Scroll'));
                unlockScroll.on('click', function (e) {
                    e.preventDefault();
                    body.css('overflow', 'auto');
                    $(this).hide();
                });
                unlockScroll.appendTo(wrapper);
            }
        }

        if (options.COURSE_ContentResizeBtn)
            setTimeout(_unlockBody, 2000);

    }

    // if (page == 'content' && !options.COURSE_ContentResizeBtn) return;

    var iframe = null;
    var getIframeCounter = 0;

    var interval = setInterval(function () {
        iframe = $('#ContentView').find('iframe');
        iframe.each(function (idx, elem) {
            if ($(elem).attr('src').trim() != '') {
                iframe = $(elem);
                clearInterval(interval);
                _pageFunc();

                if (iframe.hasClass('d2l-fileviewer-rendered-pdf')
                    && options.COURSE_AutoScrollToContent && window.innerWidth >= 768) {
                    if (options.GLB_FixNavigation) {
                        scrollToUtil(iframe, 100, $('d2l-navigation-main-footer').height());
                    } else {
                        scrollToUtil(iframe, 100, 0);
                    }
                }

                return false;
            }
        });
        getIframeCounter++;
        if (getIframeCounter > 20) {
            clearInterval(interval);
        }
    }, 300);

}

function contentListFunc() {
    return;

    var listWrapper = $('.d2l-twopanelselector-wrapper').first();
    if (!listWrapper.length) return;
    var listWrapperTop = listWrapper.offset().top;
    var navFooter = $('d2l-navigation-main-footer').first();
    var navFooterHeight = navFooter.height();
    var listLeft = listWrapper.find('.d2l-twopanelselector-side').first();

    $(window).on('scroll', function () {
        if (window.scrollY > listWrapperTop - navFooterHeight) {
            listWrapper.addClass('darklight-content-list-float');
            listLeft.css('top', navFooterHeight + 'px');
        } else {
            listWrapper.removeClass('darklight-content-list-float');
            listLeft.css('top', '');
        }
    });
}

function listMembersBtn() {

    var theForm = $('form[id="d2l_form"][action^="user_available_group_list.d2l"]');
    if (theForm.find('table').first().text().match(/No items found/g))
        return;

    $('table.d_g.d_gn').removeClass('d_g d_gn').addClass('d2l-table d2l-grid d_gl group-list');
    chrome.runtime.sendMessage({
        action: 'insertCSS',
        data: {
            code: '.group-list th,.group-list td{border-width:1px!important;border-style:solid!important;padding:5px 15px!important;}'
        }
    });

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
            $.ajax({
                type: 'get',
                url: currURLHost + '/d2l/lms/group/group_member_list.d2l?ou=' + ou + '&groupId=' + groupID[counter] + '&d2l_body_type=2',
                success: function (data) {
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
                }
            });

        }

        _getGroupMemberAjax();

    });
}

function homepageFunc() {

    var courseWidget = null, announcementWidget = null;

    $('.d2l-homepage-header-wrapper').each(function (i, e) {
        var headSelf = $(e), headText = headSelf.text();
        if (headText.match(/SYSTEM ALERT/) || headText.match(/News/)) {
            if (options.HOME_AutoHideSysAlert) {
                if (!isWLU()) {
                    // remove sys alert if empty
                    var _alertHtml = headSelf.closest('div.d2l-widget-header').next('div.d2l-widget-content').children('div.d2l-htmlblock').first().clone();
                    _alertHtml.find('a').remove();
                    _alertHtml.find('script').remove();
                    if (_alertHtml.text().trim() === '') {
                        headSelf.closest('div.d2l-widget').addClass('hidden');
                    }
                } else {
                    // remove news if empty
                    if (headSelf.closest('div.d2l-widget-header').next('div.d2l-widget-content').text().match(/There are no/)) {
                        headSelf.closest('div.d2l-widget').addClass('hidden');
                    }
                }
            }
        } else if (headText.match(/Check My System/) && !isWLU()) {
            if (options.HOME_HideCheckMySys) {
                headSelf.closest('div.d2l-widget').addClass('hidden');
            }
        } else if (headText.match(/Courses and Communities/) && !isWLU()) {

            courseWidget = headSelf.closest('div.d2l-widget');

            if (options.HOME_HidePinnedIcon)
                courseWidget.addClass('darklight-hide-pin-icon');

            if (options.HOME_AddCalendar) {
                var calendarWidget = $('<div/>');
                calendarWidget.uwCalendar('init').uwCalendar('loading').insertAfter(courseWidget);
            }

            if (options.COURSE_CustomThumb && !isWLU()) {
                courseWidget.addClass('darklight-course-thumb-loading');
            }

            function _waitForCourseLoad(isTabSwitch) {

                function _getPanelSelected() {
                    return d2lMyCourses
                        .children('d2l-tabs')
                        .children('.d2l-tabs:not(.d2l-tabs-layout)')
                        .children('d2l-tab-panel[selected]');
                }

                function _getSpinner() {
                    return _getPanelSelected()
                        .children('d2l-my-courses-content')
                        .children('.spinner-container')
                        .children('d2l-loading-spinner');
                }


                var d2lMyCourses = courseWidget
                    .children('.d2l-widget-content')
                    .children('.d2l-widget-content-padding')
                    .children('d2l-my-courses');
                var loadSpinner = _getSpinner();
                // .find('d2l-tabs d2l-tab-panel[selected] d2l-my-courses-content div.spinner-container d2l-loading-spinner');
                var intervalVal = 0, delayVal = 0, intervalCounter = 0;
                if (isBrowser('firefox')) {
                    intervalVal = 300;
                    delayVal = 500;
                } else {
                    intervalVal = 200;
                    delayVal = 200;
                }

                var intervalId = setInterval(function () {
                    if (!loadSpinner.length) {
                        loadSpinner = _getSpinner();
                    }
                    else if (typeof loadSpinner.attr('hidden') === typeof undefined
                        || (!_getPanelSelected().find('d2l-my-courses-content d2l-enrollment-card d2l-card div.d2l-card-container').length
                            && typeof _getPanelSelected().find('d2l-my-courses-content d2l-alert').attr('hidden') === typeof undefined)
                    ) {
                        // not loaded yet
                    } else {

                        // test if course tiles are loaded
                        var courseWidgetTabPanel = _getPanelSelected();
                        var courseWidgetTabPanelID = courseWidgetTabPanel.attr('id');
                        var courseWidgetTabPanelCards = courseWidgetTabPanel
                            .children('d2l-my-courses-content')
                            .children('.my-courses-content')
                            .children('.course-tile-grid')
                            .children('d2l-enrollment-card');

                        var courseTileLoaded = true;

                        courseWidgetTabPanelCards.each(function (idx, elem) {
                            var self = $(elem);
                            if (typeof self.find('d2l-card d2l-course-image img').attr('src') === typeof undefined
                                || self.find('d2l-card d2l-organization-name').text().trim() === '')
                                courseTileLoaded = false;
                        });

                        if (courseTileLoaded) {
                            // loaded
                            clearInterval(intervalId);

                            var times = isTabSwitch ? 4 : 1;

                            setTimeout(function () {
                                // calendar
                                homepageCalendar(courseWidgetTabPanelCards, courseWidgetTabPanelID);
                                // custom course thumb
                                customCourseThumbs(courseWidgetTabPanelCards);
                                // direct to content
                                courseDirectToContent(courseWidgetTabPanelCards);
                                // quick access
                                courseTileContextMenu(courseWidgetTabPanel, courseWidgetTabPanelCards);
                            }, delayVal * times);

                            // tab change
                            if (isTabSwitch !== true) {
                                d2lMyCourses
                                    .children('d2l-tabs')
                                    .children('.d2l-tabs-layout')
                                    .children('.d2l-tabs-container')
                                    .children('.d2l-tabs-container-list')
                                    .children('d2l-tab')
                                    .on('click', function (e) {
                                        $('#darklight-homepage-calendar-widget').uwCalendar('loading');
                                        setTimeout(function () {
                                            _waitForCourseLoad(true);
                                        }, 100);
                                    });
                            }

                        }
                    }

                    intervalCounter++;
                    if (intervalCounter > 50) {
                        clearInterval(intervalId);
                    }

                }, intervalVal);

            }

            setTimeout(function () {
                _waitForCourseLoad();
            }, 800);

        } else if (headText.match(/Calendar/) && isWLU()) {
            // for WLU homepage calendar
            headSelf.closest('div.d2l-widget').addClass('darklight-course-home-calendar');
        } else if (headText.match(/Announcements/) && !isWLU()) {
            announcementWidget = headSelf.closest('div.d2l-widget');
        }
    });

    // switch calendar and announce
    if (options.HOME_SwitchAnnounceAndCalendar && options.HOME_AddCalendar) {
        if (announcementWidget != null) {
            $('.darklight-homepage-calendar-widget').insertBefore(announcementWidget);
            announcementWidget.insertAfter(courseWidget);
        }
    }

    // remove homepage privacy notice
    if (options.HOME_HidePrivacy) {
        $('.homepage-col-12 .d2l-heading').each(function () {
            if ($(this).text().match(/Privacy/)) {
                $(this).closest('div.homepage-col-12').addClass('hidden');
            }
        });
    }

    // course tile meta
    var style = '';
    if (options.HOME_HideCoverPic)
        style += 'd2l-enrollment-card .d2l-enrollment-card-image-container {padding-top:0%!important}';
    if (options.HOME_HideMetaTerm)
        style += 'd2l-organization-info {display: none!important}';
    if (options.HOME_HideMetaEndDate)
        style += 'd2l-user-activity-usage {display: none!important}';
    if (options.HOME_HideCourseTabSelector)
        style += 'd2l-my-courses d2l-tabs .d2l-tabs-layout {height:0!important; border:none!important;}' +
            'd2l-my-courses d2l-tabs d2l-tab-panel {margin: 0!important;}';
    chrome.runtime.sendMessage({
        action: 'insertCSS',
        data: {code: style}
    });

    // remove announcement inline styles
    if (announcementWidget != null) {
        removeAnnouncePageFormat(true, announcementWidget);
    }
}

function homepageCalendar(cards, panelID) {
    if (isWLU()) return;

    if (!options.HOME_AddCalendar) return;

    if (typeof $('#' + panelID).attr('data-calendar-init') !== typeof undefined) {
        $('#darklight-homepage-calendar-widget').uwCalendar('switchTo', {
            id: panelID
        });
        return;
    }

    var links = [];

    cards.each(function (i, e) {
        var self = $(e).children('d2l-card').children('.d2l-card-container');
        var link = self.children('a');
        var name = self.children('.d2l-card-link-container').children('.d2l-card-content').find('d2l-organization-name');
        name = name.text().trim().split(' - ')[0];

        if (typeof link.attr('data-home-href') !== typeof undefined) {
            links.push({
                url: link.attr('data-home-href'),
                name: name
            });
        } else if (typeof link.attr('href') !== typeof undefined) {
            links.push({
                url: link.attr('href'),
                name: name
            });
        }

    });

    var counter = 0;
    var finalList = [];
    var uwCal = $('#darklight-homepage-calendar-widget');

    function _sortEvents(a, b) {
        if (a.timestamp < b.timestamp)
            return -1;
        if (a.timestamp > b.timestamp)
            return 1;
        return 0;
    }

    function _displayEvents() {
        if (finalList.length === 0) {
            uwCal.uwCalendar('empty');
        } else {
            finalList.sort(_sortEvents);
            uwCal.uwCalendar('new', {
                id: panelID,
                list: finalList
            });
        }
        $('#' + panelID).attr('data-calendar-init', '1');
    }

    function _getCoursePageAjax() {

        if (!links.length) {
            _displayEvents();
            return;
        }

        $.ajax({
            type: 'get',
            url: currURLHost + links[counter].url,
            success: function (data) {
                var _html = $($.parseHTML(data));
                var calendar = null;

                // get widget header
                _html.find('.d2l-homepage .d2l-widget .d2l-widget-header').each(function (i, e) {
                    var headerSelf = $(e);
                    if (headerSelf.text().match(/Calendar/g)) {

                        // get calendar header
                        headerSelf.next('.d2l-widget-content').find('.d2l-collapsepane-header').each(function (i2, e2) {
                            var paneHeaderSelf = $(e2);
                            if (paneHeaderSelf.text().match(/Upcoming events/g)) {

                                // get calendar list content
                                calendar = paneHeaderSelf.next('.d2l-collapsepane-content').find('ul.d2l-datalist');
                                if (calendar.children('li.d2l-datalist-item').length > 0) {

                                    // if found event
                                    calendar.children('li.d2l-datalist-item').each(function (i3, e3) {
                                        var calendarItemSelf = $(e3);

                                        var dataContent = calendarItemSelf.children('div.d2l-datalist-item-content').first();
                                        dataContent.find('div.d2l-clear').remove();

                                        var date = dataContent.children('div').first().children('div').first();
                                        var month = date.children('div').first().text().trim();
                                        var day = date.children('div').last().text().trim();
                                        var time = dataContent.children('div').first().children('div').last().children('span').first().text().trim();
                                        var title = dataContent.children('div').first().children('div').last().children('div').last().text().trim();
                                        var link = calendarItemSelf.find('#' + calendarItemSelf.attr('data-d2l-actionid')).attr('href');
                                        link = link.substring(0, link.indexOf('#'));
                                        var currYear = (new Date()).getFullYear();
                                        var theDate;

                                        if (!time.match(/\d+:\d+ [APM]{2}/g)) {
                                            // 'all day' events have highest priority
                                            theDate = new Date(month + ' ' + day + ', ' + currYear + ' 00:00:00');
                                        } else {
                                            theDate = new Date(month + ' ' + day + ', ' + currYear + ' ' + time);
                                        }

                                        finalList.push({
                                            'course': links[counter].name,
                                            'timestamp': theDate.getTime() / 1000,
                                            'year': theDate.getFullYear(),
                                            'month': theDate.getMonth(),
                                            'day': day,
                                            'weekDay': theDate.getDay(),
                                            'time': time,
                                            'title': title,
                                            'link': link
                                        });
                                    });

                                }
                                return false;
                            }
                        });
                        return false;
                    }

                });

                counter++;
                uwCal.uwCalendar('loadingMsg', 'Loading calendar (' + Math.ceil(counter / links.length * 100) + '%)');
                if (counter >= links.length) {
                    _displayEvents();
                } else {
                    _getCoursePageAjax();
                }
            }
        });

    }

    _getCoursePageAjax();

}

function customCourseThumbs(cards) {

    if (!options.COURSE_CustomThumb || isWLU()) return;

    // homepage tiles
    if (typeof cards !== typeof undefined) {

        cards.each(function (idx, elem) {

            // thumb & dropdown (customize cover menu item)
            var cardSelf = $(elem);
            var self = cardSelf.children('d2l-card').children('.d2l-card-container');
            var code = self.children('a').attr('href').match(/\/\d+/)[0].substring(1);
            // var img = self.children('.d2l-card-link-container').children('.d2l-card-header').find('.d2l-enrollment-card-image-container');
            var name = self.children('.d2l-card-link-container').children('.d2l-card-content').find('d2l-organization-name');
            var moreBtn = self.children('.d2l-card-actions').children('d2l-dropdown-more');

            cardSelf.addClass('darklight-course-thumb darklight-course-thumb-' + code);
            name = name.text().trim().split(' - ')[0];

            moreBtn.on('click', function (e) {
                var dropDownMenu = moreBtn.children('d2l-dropdown-menu');
                if (!dropDownMenu.find('d2l-menu-item.darklight-custom-course-pic').length) {
                    var menuContainer = dropDownMenu.find('d2l-menu div.d2l-menu-items');
                    var menuLink = $('<d2l-menu-item class="style-scope d2l-enrollment-card darklight-custom-course-pic"><span class="style-scope d2l-menu-item darklight-custom-course-pic-text">Customize</span></d2l-menu-item>');
                    menuLink.on('click', function (e) {
                        e.preventDefault();
                        chrome.runtime.sendMessage({
                            action: 'createTab',
                            data: {
                                url: baseURL + 'html/options.html?action=add-custom-cover&course-id=' + code + '&course-name=' + encodeURIComponent(name)
                            }
                        });
                    });
                    menuLink.appendTo(menuContainer);
                    menuLink.removeAttr('aria-haspopup');

                    var elem1 = menuLink.find('span.d2l-menu-item').not('.darklight-custom-course-pic-text');
                    var elem2 = menuLink.find('d2l-icon');
                    var succeed = false;
                    if (elem1.length && elem2.length) {
                        elem1.remove();
                        elem2.remove();
                        succeed = true;
                    }

                    if (!succeed) {
                        var intvCnt = 0;
                        var intv = setInterval(function () {
                            if (!elem1.length || !elem2.length) {
                                elem1 = menuLink.find('span.d2l-menu-item').not('.darklight-custom-course-pic-text');
                                elem2 = menuLink.find('d2l-icon');
                            } else {
                                elem1.remove();
                                elem2.remove();
                                clearInterval(intv);
                            }
                            intvCnt++;
                            if (intvCnt > 20) {
                                clearInterval(intv);
                            }
                        }, 100);
                    }
                }
            });

        });

        cards.first().closest('d2l-tab-panel').addClass('darklight-course-thumb-complete');

    }

    // course home banner
    else {
        var code = currURL.split('/');
        code = code[code.length - 1].match(/\d+/);
        $('.d2l-course-banner').addClass('darklight-course-thumb-one darklight-course-thumb-' + code);
    }
}

function courseDirectToContent(cards) {

    if (!options.COURSE_DirectToContent) return;

    // homepage
    if (typeof cards !== typeof undefined) {
        cards.each(function (idx, elem) {
            var self = $(elem).children('d2l-card').children('.d2l-card-container');
            var link = self.children('a');
            if (typeof link.attr('data-home-href') === typeof undefined) {
                link.attr('data-home-href', link.attr('href'));
                link.attr('href', link.attr('href').replace('/d2l/home/', '/d2l/le/content/') + '/Home');
            }
        });
    }
    // navbar
    else {
        var courseBtn = undefined;
        var intervalCnt = 0, intervalCnt2 = 0;

        // wait for course selector button
        var interval = setInterval(function () {

            if (typeof courseBtn === typeof undefined || !courseBtn.length) {
                courseBtn = $('.d2l-navigation-s-course-menu d2l-dropdown button');
            } else {
                clearInterval(interval);

                courseBtn.on('click', function () {

                    var d2lBtn = courseBtn.closest('d2l-navigation-button');

                    // wait for dropdown menu
                    var interval2 = setInterval(function () {

                        if (d2lBtn.attr('aria-expanded') === 'true') {
                            clearInterval(interval2);

                            var links = $('#courseSelectorId').find('ul.d2l-datalist.vui-list li a.d2l-link.d2l-datalist-item-actioncontrol');
                            links.each(function (idx, elem) {
                                var el = $(elem);
                                if (typeof el.attr('data-home-href') === typeof undefined) {
                                    el.attr('data-home-href', el.attr('href'));
                                    el.attr('href', el.attr('href').replace('/d2l/home/', '/d2l/le/content/') + '/Home');
                                }
                            });
                        }

                        intervalCnt2++;
                        if (intervalCnt2 > 40) {
                            clearInterval(interval2);
                        }

                    }, 200);

                });
            }

            intervalCnt++;
            if (intervalCnt > 20) {
                clearInterval(interval);
            }

        }, 500);
    }
}

function courseTileContextMenu(panel, cards) {

    if (!options.HOME_CourseTileContextMenu) return;

    function _showContextMenu(id, contentList, pos, courseName) {
        $('#darklight-context-menu').remove();
        var menu = '';

        if (courseName !== undefined) {
            menu += '<li class="d2l-contextmenu-item-header"><div>' + courseName + '</div></li>';
        }
        contentList.forEach(function (cl) {
            var menuTmp = '', cntTmp = 0;

            cl.list.forEach(function (c) {
                if (c.visible) {
                    menuTmp += '<li class="d2l-contextmenu-item" role="presentation">' +
                        '<a class="vui-dropdown-menu-item-link" tabindex="-1" role="menuitem" href="';
                    if (c.name == 'Course Home') {
                        menuTmp += '/d2l/home/' + id;
                    } else if (c.name == 'Content') {
                        menuTmp += '/d2l/le/content/' + id + '/Home';
                    } else if (c.name == 'Grades') {
                        menuTmp += '/d2l/lms/grades/my_grades/main.d2l?ou=' + id;
                    } else if (c.name == 'Dropbox') {
                        menuTmp += '/d2l/lms/dropbox/dropbox.d2l?ou=' + id;
                    } else if (c.name == 'Quizzes') {
                        menuTmp += '/d2l/lms/quizzing/quizzing.d2l?ou=' + id;
                    } else if (c.name == 'Surveys') {
                        menuTmp += '/d2l/lms/survey/surveys.d2l?ou=' + id;
                    } else if (c.name == 'Classlist') {
                        menuTmp += '/d2l/lms/classlist/classlist.d2l?ou=' + id;
                    } else if (c.name == 'Discussions') {
                        menuTmp += '/d2l/le/' + id + '/discussions/List';
                    } else if (c.name == 'Groups') {
                        menuTmp += '/d2l/lms/group/group_list.d2l?ou=' + id;
                    } else if (c.name == 'Online Rooms') {
                        menuTmp += '/d2l/im/onlinerooms/roomlist.d2l?ou=' + id;
                    } else if (c.name == 'Checklist') {
                        menuTmp += '/d2l/lms/checklist/checklists.d2l?ou=' + id;
                    } else if (c.name == 'Rubrics') {
                        menuTmp += '/d2l/lp/rubrics/list.d2l?ou=' + id;
                    }
                    menuTmp += '"><span>' + c.name + '</span></a></li>';
                    cntTmp++;
                }
            });


            if (cl.name !== undefined && cntTmp > 0) {
                var extra = '';
                if (cl.name == '') extra = ' empty';
                menuTmp = '<li class="d2l-contextmenu-item-title' + extra + '"><div>' + cl.name + '</div></li>' + menuTmp;
            }

            menu += menuTmp;

        });

        menu = $(menu);
        menu.find('li').first().addClass('d2l-first-visible-item');
        menu.find('li').last().addClass('d2l-last-visible-item');
        var ul = $('<ul class="d2l-contextmenu-daylightoff" ' +
            'data-floatingcontainerid="darklight-context-menu" ' +
            'role="presentation"></ul>');
        menu.appendTo(ul);
        var contain = $('<div id="darklight-context-menu" ' +
            'class="d2l-floating-container vui-dropdown-menu d2l-floating-container-autoclose darklight-context-menu" role="menu" ' +
            'tabindex="0"></div>');
        ul.appendTo(contain);
        var zindex = 90;
        if (panel === undefined) zindex = 1500;
        contain.css({
            left: pos.x,
            top: pos.y,
            'z-index': zindex
        });
        contain.appendTo(body);

        if (contain.height() + (pos.y - window.scrollY + 20) > window.innerHeight
            && contain.height() < window.innerHeight - 100
            && contain.height() < pos.y - $('body header').height()) {
            contain.css({
                top: pos.y - contain.height()
            });
        }

        contain.find('li.d2l-contextmenu-item').hover(function () {
            $(this).addClass('d2l-contextmenu-item-hover vui-dropdown-menu-item-focus');
        }, function () {
            $(this).removeClass('d2l-contextmenu-item-hover vui-dropdown-menu-item-focus');
        });

        html.on('click', function (e) {
            // if (!$(e.target).closest('#darklight-context-menu').length) {
            //     $('#darklight-context-menu').remove();
            // }
            if (!$('#darklight-context-menu').has(e.target).length) {
                $('#darklight-context-menu').remove();
            }
            // if (!e.target.matches('#darklight-context-menu')) {
            //     $('#darklight-context-menu').remove();
            // }
        });

    }

    // homepage
    if (typeof panel !== typeof undefined) {
        if (typeof panel.attr('data-context-menu-init') !== typeof undefined) return;
        panel.attr('data-context-menu-init', 'true');

        var contentList = options.HOME_CourseTileContextMenuData;

        cards.each(function (idx, elem) {
            var self = $(elem).children('d2l-card').children('.d2l-card-container');
            var code = self.children('a').attr('href').match(/\/\d+/)[0].substring(1);
            self.children('a').contextmenu(function (e) {
                e.preventDefault();
                _showContextMenu(code, contentList, {
                    x: e.pageX,
                    y: e.pageY
                });
            });
        });
    }
    // course selector
    else {

        var courseBtn = undefined;
        var intervalCnt = 0, intervalCnt2 = 0;
        var contentList = options.HOME_CourseTileContextMenuData;

        // wait for course selector button
        var interval = setInterval(function () {

            if (typeof courseBtn === typeof undefined || !courseBtn.length) {
                courseBtn = $('.d2l-navigation-s-course-menu d2l-dropdown button');
            } else {
                clearInterval(interval);

                courseBtn.on('click', function () {

                    var d2lBtn = courseBtn.closest('d2l-navigation-button');

                    // wait for dropdown menu
                    var interval2 = setInterval(function () {

                        if (d2lBtn.attr('aria-expanded') === 'true') {
                            clearInterval(interval2);

                            var linksLi = $('#courseSelectorId').find('ul.d2l-datalist.vui-list li');
                            linksLi.each(function (idx, elem) {
                                var el = $(elem).find('a.d2l-link.d2l-datalist-item-actioncontrol');
                                if (typeof el.attr('data-context-menu-init') === typeof undefined) {
                                    el.attr('data-context-menu-init', 'true');
                                    var code = el.attr('href').match(/\/\d+/)[0].substring(1);
                                    var name = el.text().trim().split(' - ')[0];
                                    $(elem).contextmenu(function (e) {
                                        e.preventDefault();
                                        _showContextMenu(code, contentList, {
                                            x: e.pageX,
                                            y: e.pageY
                                        }, name);
                                    });
                                }
                            });
                        }

                        intervalCnt2++;
                        if (intervalCnt2 > 40) {
                            clearInterval(interval2);
                        }

                    }, 200);

                });
            }

            intervalCnt++;
            if (intervalCnt > 20) {
                clearInterval(interval);
            }

        }, 500);

    }
}

function dropboxMarkFunc() {
    var header = $('div.sticky-assessment-navigation');
    if (!header.length) return;

    var hideBtn = $('<div class="dropbox-header-toggle">Toggle Header</div>');
    hideBtn.on('click', function (e) {
        e.preventDefault();
        header.toggle();
    });
    hideBtn.insertAfter(header);
}

function removeAnnouncePageFormat(isHomepage, announcementWidget, counter) {
    function _removeCSS(elem) {
        elem.css({
            'font-size': '',
            'line-height': '',
            'margin': '',
            'padding': '',
            'font-family': ''
        });

        $.each(elem, function (i, e) {
            var self = $(e);
            if (self.css('color').match(/^rgb\(0, 0, 0\)$/)) {
                self.css('color', '');
            }
        });

    }

    if (!options.HOME_RemoveAnnounceFormat) return;

    if (counter === undefined) {
        counter = 0;
    } else if (counter > 20) {
        return;
    }

    if (isHomepage === true) {

        if (announcementWidget.find('template').length) {
            setTimeout(function () {
                removeAnnouncePageFormat(true, announcementWidget, ++counter);
            }, 500);
            return;
        }

        announcementWidget.find('div.d2l-widget-content ul.d2l-datalist').children('li').each(function (i, e) {
            _removeCSS($(e).find('div.d2l-htmlblock').find('p, span, ul, ol, li, table, tr, th, td'));
        });

    } else {
        var announceTable = $('#wrapper');

        if (!announceTable.length || announceTable.find('template').length) {
            setTimeout(function () {
                removeAnnouncePageFormat(false, null, ++counter);
            }, 500);
            return;
        }

        announceTable.find('table.d2l-table tr.d_detailsRow').each(function (i, e) {
            _removeCSS($(e).find('td div.d2l-htmlblock').find('p, span, ul, ol, li, table, tr, th, td'));
        });

    }

}

function initDarklightFunc() {

    // custom font
    if (options.GLB_CustomFont) {
        customFont();
    }

    // back to top button
    if (options.GLB_BackToTopButton) {
        addBackToTopButton();
    }

    if (options.GLB_FixNavigation && options.GLB_BackToTopButtonNavbar) {
        addBackToTopButtonNavbar();
    }

    // fix navigation
    if (options.GLB_FixNavigation) {
        // fixNavigation();
        fixNavigationSticky();
    }

    // display group members
    if (currURL.match(/\/d2l\/lms\/group\/user_available_group_list\.d2l/g) && options.GROUP_ListMembersBtn) {
        listMembersBtn();
    }

    // content page func
    if (currURL2.match(/\/d2l\/le\/content\/\d+\/Home/g)) {
        contentListFunc();
    }

    // content page func
    if (currURL.match(/\/d2l\/le\/content\/\d+\/viewContent\/\d+\/View/g)) {
        contentPageFunc();
    }

    // quiz & survey resize
    if (currURL.match(/\/quizzing\/user\/attempt\//g) || currURL.match(/\/survey\/user\/attempt\//g)) {
        quizPageFunc();
    }

    // homepage
    if (currURL2.match(/\/d2l\/home$/)) {
        homepageFunc();
    }

    // course home
    if (currURL2.match(/\/d2l\/home\/\d+$/)) {
        customCourseThumbs();

        $('.d2l-widget-header').each(function (i, e) {
            var headText = $(e).text();
            if (headText.match(/Calendar/i)) {
                $(e).closest('div.d2l-widget').addClass('darklight-course-home-calendar');
            } else if (headText.match(/Announcements/i)) {
                removeAnnouncePageFormat(true, $(e).closest('div.d2l-widget'));
            }
        });
    }

    courseDirectToContent();
    courseTileContextMenu();

    // dropbox mark
    if (currURL.match(/\/d2l\/lms\/dropbox\/admin\/mark\/folder_user_mark\.d2l/i)) {
        // dropboxMarkFunc();
    }

    // announcement page
    if (currURL.match(/\/d2l\/lms\/news\/main\.d2l/i)) {
        removeAnnouncePageFormat();
    }

    // popup page
    if (window.opener && window.opener !== window) {
        if (currURL.match(/\/d2l\/le\/content\/\d+\/fullscreen\/\d+\/View/i)) {
            var cssText = '.d2l-popup-page .d2l-popup-body::-webkit-scrollbar{width:0!important}' +
                '.d2l-popup-page .d2l-popup-body{scrollbar-width:none}';
            if ($('.d2l-popup-title').length)
                cssText += 'iframe.d2l-fileviewer-rendered-pdf{height:calc(100vh - 60px)!important;}';
            chrome.runtime.sendMessage({
                action: 'insertCSS',
                data: {code: cssText}
            });
            injectCSS('iframe.d2l-fileviewer-rendered-pdf-dialog{height:calc(100vh - 60px)!important;}', 'body', 'text');
        }
    }

    // overlay
    removeOverlay();

}

function initDarklightIdle() {

    if (!options.GLB_Enabled)
        return;

    // disable on Waterloo Learn
    if (!options.GLB_EnableForWaterloo && !isWLU())
        return;

    // disable on Laurier MLS
    if (!options.GLB_EnableForLaurier && isWLU())
        return;

    if (currURL.includes('/content/enforced/'))
        return;

    if (!head.length || !body.length || typeof body.attr('class') === typeof undefined) {
        removeOverlay(true);
        return;
    }

    // conflict detect
    detectExtConflict();

    // favicon
    if (options.GLB_DarklightFavicon) {
        head.find('link[rel="icon"]').remove();
        head.append($('<link rel="icon" type="image/png" href="' + baseURL + 'icon/icon32.png' + '">'));
    }

    // css
    // injectCSS('html{font-size:' + options.GLB_BasicFontSize + 'px}', 'head', 'text');
    // injectCSS(baseURL + 'css/common.css', 'head');
    injectCSS(baseURL + 'theme/theme_' + options.GLB_ThemeID + '/common.css', 'head');
    if (options.GLB_EnableCustomStyle)
        injectCSS(options.GLB_CustomCSS, 'head', 'text');

    // js
    var jsText = 'var dlightData = {';
    jsText += 'baseURL : "' + baseURL + '",';
    jsText += 'currURL : "' + currURL + '",';
    jsText += 'currURL2 : "' + currURL2 + '",';
    jsText += 'currURLHost : "' + currURLHost + '",';
    jsText += 'options : ' + JSON.stringify(options) + ',';
    jsText += 'themeConfigs : ' + JSON.stringify(themeConfigs) + '';
    jsText += '}';
    var params = document.createElement("script");
    params.textContent = jsText;
    document.head.appendChild(params);

    injectJS(baseURL + 'js/inject.js', 'head');

    // theme js
    var scriptArr = [];
    scriptArr.push({
        file: 'theme/theme_' + options.GLB_ThemeID + '/functions.js'
    });
    if (options.GLB_EnableCustomStyle) {
        scriptArr.push({
            code: options.GLB_CustomJS
        });
    }
    chrome.runtime.sendMessage({
        action: 'executeScript',
        data: scriptArr
    });

    initDarklightFunc();
}

var html = $('html'), head = $('head'), body = $('body');

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
                $('#darklight-load-overlay').remove();
            }
        }
    }, 100);
}


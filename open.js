// ==UserScript==
// @name         微博相册查看大图
// @namespace    Shurlormes
// @version      0.3
// @description  给微博相册添加一个快速打开大图的按钮，方便浏览图片。
// @author       Shurlormes
// @match        *://*.weibo.com/*
// @icon         https://weibo.com/favicon.ico
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

(function() {
    'use strict';
    const OPEN_BTN_STYLE = 'cursor: zoom-in; position: relative;width: 36px;height: 20px;font-size: 12px;padding: 4px;background: #f5be11;text-align: center;border-radius: 36px;bottom: 20px;left: 5px;';
    const OPEN_BTN_CLASS_NAME = 'shurlormes-open-btn';
    const ADDED_OPEN_BTN_CLASS_NAME = 'shurlormes-added-open-btn';
    const OPEN_HREF_PREFIX = 'https://wx4.sinaimg.cn/mw2000';
    const TYPE_IMG = 0;
    const TYPE_VIDEO = 1;
    const TYPE_TAGS = ['img', 'video']
    const TYPE_ATTRS = ['src', 'poster']

    const OPEN_TXT = 'Open';

    //执行间隔，单位毫秒
    const INTERVAL_TIME = 500;

    let openBtnClickEvent = function(obj, type) {
        let parent = obj.parentElement;
        let items = parent.getElementsByTagName(TYPE_TAGS[type]);
        if(items.length > 0) {
            let item = items[0];
            let imgSrc = item.getAttribute(TYPE_ATTRS[type]);
            let href = OPEN_HREF_PREFIX + imgSrc.substring(imgSrc.lastIndexOf('/'));
            window.open(href);
        }
    }

    let openImageEvent = function(e) {
        e.cancelBubble = true;
        e.stopPropagation();
        openBtnClickEvent(e.target, TYPE_IMG);
    }

    let openGifEvent = function(e) {
        e.cancelBubble = true;
        e.stopPropagation();
        openBtnClickEvent(e.target, TYPE_VIDEO);
    }

    let generateOpenBtn = function(objs, type) {
        if(objs.length > 0) {
            for (let i = 0; i < objs.length; i++) {
                let obj = objs[i];
                let parent = obj.parentElement;
                let index = 0;
                while (parent.className.indexOf('woo-box-item-inlineBlock') === -1 && index < 2) {
                    parent = parent.parentElement;
                    index++;
                }

                if(parent.className.indexOf('woo-box-item-inlineBlock') !== -1) {

                    let openBtn = document.createElement("span");
                    openBtn.innerText = OPEN_TXT;
                    openBtn.style = OPEN_BTN_STYLE;
                    openBtn.className = OPEN_BTN_CLASS_NAME
                    openBtn.onclick = type === TYPE_IMG ? openImageEvent : openGifEvent;
                    if(parent.getElementsByClassName(OPEN_BTN_CLASS_NAME).length === 0) {
                        obj.classList.add(ADDED_OPEN_BTN_CLASS_NAME);
                        parent.appendChild(openBtn);
                    }
                }
            }
        }
    }

    let appendBtnEvent = function () {
        let imgs = document.querySelectorAll(`.woo-picture-img:not(.${ADDED_OPEN_BTN_CLASS_NAME})`)
        generateOpenBtn(imgs, TYPE_IMG);

        let videos = document.querySelectorAll(`video:not(.${ADDED_OPEN_BTN_CLASS_NAME})`);
        generateOpenBtn(videos, TYPE_VIDEO);
    }

    let appendBtnClickEvent = function() {
        if(window.location.href.indexOf('tabtype=album') !== -1) {
            appendBtnEvent();
        }
    }

    setInterval(appendBtnClickEvent, INTERVAL_TIME);
})();
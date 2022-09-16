// ==UserScript==
// @name         知乎屏蔽指定用户
// @namespace    Shurlormes
// @version      0.1
// @description  知乎屏蔽指定用户，将他的评论隐藏。
// @author       Shurlormes
// @match        *://*.zhihu.com/question/*
// @icon         https://static.zhihu.com/heifetz/favicon.ico
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

(function() {
    'use strict';

    const BLOCK_BTN_STYLE = 'cursor: pointer;position: relative;width: 36px;height: 20px;font-size: 12px;padding: 2px;background: rgb(241 129 129);text-align: center;border-radius: 36px;left: 5px;color: black;';
    const CANCEL_BTN_STYLE = 'cursor: pointer;position: relative;width: 36px;height: 20px;font-size: 12px;padding: 2px;background: rgb(129 200 241);text-align: center;border-radius: 36px;left: 5px;color: black;';
    const COMMENT_CONTENT_CLASS = 'CommentContent';
    const BTN_GROUP_CLASS = 'shurlormes-btn-group';
    const BLOCK_BTN_CLASS = 'shurlormes-block-btn-';
    const CANCEL_BTN_CLASS = 'shurlormes-cancel-btn-';
    const USER_COMPONENT_CLASS = 'shurlormes-user-component';
    const USER_NAME_COMPONENT_CLASS = 'shurlormes-user-name-component';
    const BTN_APPENDED_COMPONENT_CLASS = 'shurlormes-btn-appended-component';
    const USER_COMMENT_COMPONENT_CLASS = 'shurlormes-user-comment-component';
    const HIDE_USER_COMMENT_COMPONENT_CLASS = "shurlormes-hide-user-comment-component-";
    const HIDE_CLASS = 'shurlormes-hide';
    const ATTR_USER_ID = 'shurlormes-user-id';
    const BLOCK_USER_KEY_PREFIX = 'shurlormes-block-user-';

    //执行间隔，单位毫秒
    const INTERVAL_TIME = 500;

    //屏蔽替换文本
    const BLOCK_REPLACE_TXT = '[已屏蔽]';

    const BLOCK_BTN_TXT = '屏蔽';
    const CANCEL_BTN_TXT = '取消';

    const TYPE_BLOCK = 0;
    const TYPE_CANCEL = 1;
    const TYPE_BTN_CLASS = [BLOCK_BTN_CLASS, CANCEL_BTN_CLASS]


    let showCancelUserComment = function(cancelUserId) {
        let hideComponents = document.getElementsByClassName(HIDE_USER_COMMENT_COMPONENT_CLASS + cancelUserId);
        while (hideComponents.length > 0) {
            let hideComponent = hideComponents[0];
            let commentComponents = hideComponent.parentElement.getElementsByClassName(USER_COMMENT_COMPONENT_CLASS);
            if(commentComponents.length > 0) {
                commentComponents[0].innerHTML = hideComponent.innerHTML;
                commentComponents[0].classList.remove(HIDE_CLASS);
            }
            hideComponent.remove();
        }
    }

    let hideBlockedUserComment = function() {
        let commentComponents = document.querySelectorAll(`.${USER_COMMENT_COMPONENT_CLASS}:not(.${HIDE_CLASS})`)
        if(commentComponents.length > 0) {
            for (let i = 0; i < commentComponents.length; i++) {
                let commentComponent = commentComponents[i];
                let userId = commentComponent.getAttribute(ATTR_USER_ID);
                let hasBlocked = localStorage.getItem(BLOCK_USER_KEY_PREFIX + userId);
                if(hasBlocked && commentComponent.className.indexOf(HIDE_CLASS) === -1) {
                    let hideComponent = document.createElement('div');
                    hideComponent.innerHTML = commentComponent.innerHTML;
                    hideComponent.hidden = true;
                    hideComponent.className = HIDE_USER_COMMENT_COMPONENT_CLASS + userId;

                    commentComponent.innerText = BLOCK_REPLACE_TXT;
                    commentComponent.classList.add(HIDE_CLASS);
                    commentComponent.parentElement.appendChild(hideComponent);
                }
            }
        }
    }

    let changeBtn = function(userId, type) {
        let btns = document.getElementsByClassName(TYPE_BTN_CLASS[type] + userId);
        for (let i = 0; i < btns.length; i++) {
            btns[i].hidden = true;
        }
        let revertBtns = document.getElementsByClassName(TYPE_BTN_CLASS[1 - type] + userId);
        for (let i = 0; i < btns.length; i++) {
            revertBtns[i].hidden = false;
        }
    }

    let blockBtnClickEvent = function(e) {
        e.cancelBubble = true;
        e.stopPropagation();

        let userId = e.target.getAttribute(ATTR_USER_ID);
        localStorage.setItem(BLOCK_USER_KEY_PREFIX + userId, 1);

        hideBlockedUserComment();
        changeBtn(userId, TYPE_BLOCK);
    }

    let cancelBtnClickEvent = function(e) {
        e.cancelBubble = true;
        e.stopPropagation();

        let userId = e.target.getAttribute(ATTR_USER_ID);
        localStorage.removeItem(BLOCK_USER_KEY_PREFIX + userId);

        showCancelUserComment(userId);
        changeBtn(userId, TYPE_CANCEL);
    }

    let markBlockElements = function() {
        let commentComponents = document.querySelectorAll(`.${COMMENT_CONTENT_CLASS}:not(.${USER_COMMENT_COMPONENT_CLASS})`)
        if(commentComponents.length > 0) {
            for (let i = 0; i < commentComponents.length; i++) {
                let commentComponent = commentComponents[i];
                let userComponent = commentComponent.parentElement;
                let userNameComponent = userComponent.getElementsByClassName('Popover')[0].parentElement;

                let userHref = userNameComponent.getElementsByTagName('a')[0].getAttribute('href');
                let userId = userHref.substr(userHref.lastIndexOf("/") + 1)

                userNameComponent.classList.add(USER_NAME_COMPONENT_CLASS);
                userNameComponent.setAttribute(ATTR_USER_ID, userId);

                userComponent.classList.add(USER_COMPONENT_CLASS);
                userComponent.setAttribute(ATTR_USER_ID, userId);

                commentComponent.classList.add(USER_COMMENT_COMPONENT_CLASS);
                commentComponent.setAttribute(ATTR_USER_ID, userId);
            }
        }
    }

    let appendBlockBtn = function() {
        let userNameComponents = document.querySelectorAll(`.${USER_NAME_COMPONENT_CLASS}:not(.${BTN_APPENDED_COMPONENT_CLASS})`);
        if(userNameComponents.length > 0) {
            for (let i = 0; i < userNameComponents.length; i++) {
                let userNameComponent = userNameComponents[i];
                let userId = userNameComponent.getAttribute(ATTR_USER_ID);
                if(userNameComponent.getElementsByClassName(BTN_GROUP_CLASS).length === 0) {
                    let hasBlocked = localStorage.getItem(BLOCK_USER_KEY_PREFIX + userId);

                    let blockBtn = document.createElement("span");
                    blockBtn.setAttribute(ATTR_USER_ID, userId);
                    blockBtn.classList.add(BTN_GROUP_CLASS)
                    blockBtn.classList.add(BLOCK_BTN_CLASS + userId)
                    blockBtn.style = BLOCK_BTN_STYLE;
                    blockBtn.innerText = BLOCK_BTN_TXT;
                    blockBtn.onclick = blockBtnClickEvent;
                    blockBtn.hidden = hasBlocked

                    let cancelBtn = document.createElement("span");
                    cancelBtn.setAttribute(ATTR_USER_ID, userId);
                    cancelBtn.classList.add(BTN_GROUP_CLASS)
                    cancelBtn.classList.add(CANCEL_BTN_CLASS + userId)
                    cancelBtn.style = CANCEL_BTN_STYLE;
                    cancelBtn.innerText = CANCEL_BTN_TXT;
                    cancelBtn.onclick = cancelBtnClickEvent;
                    cancelBtn.hidden = !hasBlocked

                    userNameComponent.appendChild(blockBtn);
                    userNameComponent.appendChild(cancelBtn);
                    userNameComponent.classList.add(BTN_APPENDED_COMPONENT_CLASS);
                }
            }
        }
    }

    let mainEvent = function() {
        markBlockElements();
        appendBlockBtn();
        hideBlockedUserComment();
    }

    setInterval(mainEvent, INTERVAL_TIME);


})();
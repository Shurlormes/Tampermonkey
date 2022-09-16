const BLOCK_BTN_STYLE = 'cursor: pointer;position: relative;width: 36px;height: 20px;font-size: 12px;padding: 2px;background: rgb(241 129 129);text-align: center;border-radius: 36px;left: 5px;color: black;';
const CANCEL_BTN_STYLE = 'cursor: pointer;position: relative;width: 36px;height: 20px;font-size: 12px;padding: 2px;background: rgb(129 200 241);text-align: center;border-radius: 36px;left: 5px;color: black;';

const BTN_GROUP_CLASS = 'shurlormes-btn-group';
const BLOCK_BTN_CLASS = 'shurlormes-block-btn-';
const CANCEL_BTN_CLASS = 'shurlormes-cancel-btn-';

const USER_COMPONENT_CLASS = 'shurlormes-user-component';
const USER_NAME_COMPONENT_CLASS = 'shurlormes-user-name-component';
const USER_COMMENT_COMPONENT_CLASS = 'shurlormes-user-comment-component';

const HIDE_USER_COMMENT_COMPONENT_CLASS = "shurlormes-hide-user-comment-component-";
const HIDE_CLASS = 'shurlormes-hide';

const ATTR_USER_ID = 'shurlormes-user-id';

const BLOCK_USER_KEY_PREFIX = 'shurlormes-block-user-';

//执行间隔，单位毫秒
const INTERVAL_TIME = 500;

//屏蔽替换文本
const BLOCK_REPLACE_TXT = '[已屏蔽]';


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
    let commentComponents = document.getElementsByClassName(USER_COMMENT_COMPONENT_CLASS);
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

let blockBtnClickEvent = function(e) {
    e.cancelBubble = true;
    e.stopPropagation();
    let userId = e.target.getAttribute(ATTR_USER_ID);
    localStorage.setItem(BLOCK_USER_KEY_PREFIX + userId, 1);
    hideBlockedUserComment();
    let btns = document.getElementsByClassName(BLOCK_BTN_CLASS + userId);
    while (btns.length > 0) {
        btns[0].remove();
    }
    appendBlockBtn();
}

let cancelBtnClickEvent = function(e) {
    e.cancelBubble = true;
    e.stopPropagation();
    let userId = e.target.getAttribute(ATTR_USER_ID);
    localStorage.removeItem(BLOCK_USER_KEY_PREFIX + userId);
    let btns = document.getElementsByClassName(CANCEL_BTN_CLASS + userId);
    while (btns.length > 0) {
        btns[0].remove();
    }
    showCancelUserComment(userId);
    appendBlockBtn();
}

let markBlockElements = function() {
    let commentComponents = document.getElementsByClassName('CommentContent');

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

    let userNameComponents = document.getElementsByClassName(USER_NAME_COMPONENT_CLASS);

    if(userNameComponents.length > 0) {
        for (let i = 0; i < userNameComponents.length; i++) {
            let userNameComponent = userNameComponents[i];
            let userId = userNameComponent.getAttribute(ATTR_USER_ID);
            if(userNameComponent.getElementsByClassName(BTN_GROUP_CLASS).length === 0) {
                let hasBlocked = localStorage.getItem(BLOCK_USER_KEY_PREFIX + userId);
                let btn = document.createElement("span");
                btn.setAttribute(ATTR_USER_ID, userId);
                btn.classList.add(BTN_GROUP_CLASS)
                btn.classList.add(hasBlocked ? CANCEL_BTN_CLASS + userId : BLOCK_BTN_CLASS + userId)
                btn.style = hasBlocked ? CANCEL_BTN_STYLE : BLOCK_BTN_STYLE;
                btn.innerText = hasBlocked ? '取消' : '屏蔽';
                btn.onclick = hasBlocked ? cancelBtnClickEvent : blockBtnClickEvent;
                userNameComponent.appendChild(btn);
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

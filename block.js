// ==UserScript==
// @name         知乎屏蔽用户评论
// @namespace    Shurlormes
// @version      0.6
// @description  知乎屏蔽指定用户，将他的评论隐藏。
// @author       Shurlormes
// @match        *://*.zhihu.com/*
// @icon         https://static.zhihu.com/heifetz/favicon.ico
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @license      GPL-3.0
// ==/UserScript==

(function() {
    'use strict';

    const BLOCK_BTN_STYLE = 'cursor: pointer;position: relative;width: 36px;height: 20px;font-size: 12px;padding: 2px;background: rgb(241 129 129);text-align: center;border-radius: 36px;left: 5px;color: black;';
    const CANCEL_BTN_STYLE = 'cursor: pointer;position: relative;width: 36px;height: 20px;font-size: 12px;padding: 2px;background: rgb(129 200 241);text-align: center;border-radius: 36px;left: 5px;color: black;';
    const TEXTAREA_STYLE = 'resize: none;padding:5px;height:100%;width:98%;overflow:auto;';
    const COMMENT_CONTENT_CLASS = 'CommentContent';
    const IMPORT_TEXTAREA_CLASS = 'shurlormes-import-textarea';
    const BTN_GROUP_CLASS = 'shurlormes-btn-group';
    const BLOCK_BTN_CLASS = 'shurlormes-block-btn-';
    const CANCEL_BTN_CLASS = 'shurlormes-cancel-btn-';
    const USER_COMPONENT_CLASS = 'shurlormes-user-component';
    const USER_RIGHT_COMPONENT_CLASS = 'shurlormes-user-right-component';
    const USER_NAME_COMPONENT_CLASS = 'shurlormes-user-name-component';
    const BTN_APPENDED_COMPONENT_CLASS = 'shurlormes-btn-appended-component';
    const USER_COMMENT_COMPONENT_CLASS = 'shurlormes-user-comment-component';
    const USER_COMMENT_COMPONENT_WITH_ID_CLASS = 'shurlormes-user-comment-component-';
    const HIDE_USER_COMMENT_COMPONENT_CLASS = "shurlormes-hide-user-comment-component-";
    const DISPLAY_NONE_CLASS = 'shurlormes-display-none';
    const BLOCKED_CLASS = 'shurlormes-blocked';
    const ATTR_USER_ID = 'shurlormes-user-id';
    const BLOCK_USER_KEY_PREFIX = 'shurlormes-block-user-';
    const BLOCK_LEVEL_KEY = 'shurlormes-block-level';

    //执行间隔，单位毫秒
    const INTERVAL_TIME = 500;

    //屏蔽替换文本
    const BLOCK_REPLACE_TXT = '[已屏蔽]';

    const BLOCK_BTN_TXT = '屏蔽';
    const CANCEL_BTN_TXT = '取消';

    const BLOCK_USER_MENU_TXT = '🙎‍♂️屏蔽用户';
    const BLOCK_COMMENT_MENU_TXT = '📘屏蔽评论';

    const TYPE_BLOCK = 0;
    const TYPE_CANCEL = 1;
    const TYPE_BTN_CLASS = [BLOCK_BTN_CLASS, CANCEL_BTN_CLASS]
    const TYPE_BTN_STYLE = [BLOCK_BTN_STYLE, CANCEL_BTN_STYLE]
    const TYPE_BTN_TXT = [BLOCK_BTN_TXT, CANCEL_BTN_TXT]

    //弹出层，代码参考：https://www.jianshu.com/p/79970121dbe2
    const popup = (function(){
        class Popup {
            // 构造函数中定义公共要使用的div
            constructor() {
                // 定义所有弹窗都需要使用的遮罩
                this.mask = document.createElement('div')
                // 设置样式
                this.setStyle(this.mask, {
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, .2)',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    'z-index': 999
                })
                // 创建中间显示内容的水平并垂直居中的div
                this.content = document.createElement('div')
                // 设置样式
                this.setStyle(this.content, {
                    width: '600px',
                    height: '400px',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 2px #999',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    borderRadius: '3px'
                })
                // 将这个小div放在遮罩中
                this.mask.appendChild(this.content)
            }
            // 中间有弹框的 - 适用于alert和confirm
            middleBox(param) {
                // 先清空中间小div的内容 - 防止调用多次，出现混乱
                this.content.innerHTML = ''
                // 定义标题和内容变量
                let title = '默认标题内容';
                // 检测参数类型
                title = param.title
                // 将遮罩放在body中显示
                document.body.appendChild(this.mask)
                // 给中间的小div设置默认的排版
                // 上面标题部分
                this.title = document.createElement('div')
                // 设置样式
                this.setStyle(this.title, {
                    width: '100%',
                    height: '50px',
                    borderBottom: '1px solid #ccc',
                    lineHeight: '50px',
                    paddingLeft: '20px',
                    boxSizing: 'border-box',
                    color: '#050505'
                })
                // 设置默认标题内容
                this.title.innerText = title
                // 将标题部分放在中间div中
                this.content.appendChild(this.title)
                // 关闭按钮
                this.closeBtn = document.createElement('a')
                // 设置内容
                this.closeBtn.innerText = '×'
                // 设置href属性
                this.closeBtn.setAttribute('href', 'javascript:;')
                // 设置样式
                this.setStyle(this.closeBtn, {
                    textDecoration: 'none',
                    color: '#666',
                    position: 'absolute',
                    right: '10px',
                    top: '6px',
                    fontSize: '25px'
                })
                // 将关闭按钮放在中间小div中
                this.content.appendChild(this.closeBtn)
                // 下面具体放内容的部分
                this.description = document.createElement('div')
                // 将默认内容放在中间的小div中
                this.content.appendChild(this.description)
                // 设置样式
                this.setStyle(this.description, {
                    color: '#666',
                    paddingLeft: '20px',
                    lineHeight: '50px'
                })
            }
            // 弹出提示框
            alert(param) {
                this.middleBox(param)
                this.dialogContent = document.createElement('div')
                this.setStyle(this.dialogContent,{
                    "padding":"15px",
                    "max-height":"400px"
                })
                this.dialogContent.innerHTML = param.content;
                this.content.appendChild(this.dialogContent);
                // 关闭按钮和确定按钮的点击事件
                this.closeBtn.onclick = () => this.close()
            }
            dialog(param) {
                this.middleBox(param)
                this.btn = document.createElement('button');
                // 添加内容
                this.btn.innerText = param.confirmTxt ? param.confirmTxt : '确定';
                // 设置内容
                this.setStyle(this.btn, {
                    backgroundColor: 'rgb(30, 159, 255)',
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px',
                    outline: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: '16px',
                    borderRadius: '2px',
                    padding: '0 10px',
                    height: '30px',
                    lineHeight: '30px'
                });

                // 右下角的确定按钮
                let confirm = function(){}
                if(param.confirm && {}.toString.call(param.confirm) === '[object Function]') {
                    confirm = param.confirm;
                }

                // 将按钮放在div中
                this.content.appendChild(this.btn)

                this.dialogContent = document.createElement('div')
                this.setStyle(this.dialogContent,{
                    "padding":"15px",
                    "max-height":"400px"
                })
                this.dialogContent.innerHTML = param.content;
                this.content.appendChild(this.dialogContent);
                // 确定按钮的点击事件
                this.btn.onclick = () => {
                    confirm()
                    this.close()
                }
                this.closeBtn.onclick = () => this.close()
            }
            close(timerId) {
                // 如果有定时器，就停止定时器
                if(timerId) clearInterval(timerId)
                // 将遮罩从body中删除
                document.body.removeChild(this.mask)
            }
            // 设置样式的函数
            setStyle(ele, styleObj) {
                for(let attr in styleObj){
                    ele.style[attr] = styleObj[attr]
                }
            }
        }
        let popup = null;
        return (function() {
            if(!popup) {
                popup = new Popup()
            }
            return popup;
        })()
    })()

    GM_addStyle(
        '.shurlormes-display-none {display:none}'
    );

    GM_registerMenuCommand('导出屏蔽用户', function() {
        const blockUserKeys = [];
        if(localStorage.length > 0){
            for(let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if(key.indexOf(BLOCK_USER_KEY_PREFIX) !== -1) {
                    blockUserKeys.push(key.replaceAll(BLOCK_USER_KEY_PREFIX, ''));
                }
            }
        }

        let blockedUserInfo = blockUserKeys.length > 0 ? blockUserKeys.join(',') : '';
        let content = `
				<div>
				    <div style="margin-bottom: 5px;">请复制以下内容用以导入</div>
					<div style="height:250px;width:100%;">
						<textarea readonly="readonly" style="${TEXTAREA_STYLE}">${blockedUserInfo}</textarea>
					</div>
				</div>
			`;
        popup.alert({title: '导出屏蔽用户', content: content})
    });

    GM_registerMenuCommand('导入屏蔽用户', function() {
        let content = `
				<div>
				    <div style="margin-bottom: 5px;">请将复制的导出文本粘贴至文本框</div>
					<div style="height:250px;width:100%;">
						<textarea class="${IMPORT_TEXTAREA_CLASS}" style="${TEXTAREA_STYLE}"></textarea>
					</div>
				</div>
			`;
        popup.dialog({
            title: '导入屏蔽用户',
            content: content,
            confirmTxt: '导入',
            confirm: function () {
                const txt = document.getElementsByClassName(IMPORT_TEXTAREA_CLASS)[0].value;
                if(txt) {
                    let blockUserIds = txt.split(',');
                    if(blockUserIds.length > 0) {
                        for (let i = 0; i < blockUserIds.length; i++) {
                            localStorage.setItem(BLOCK_USER_KEY_PREFIX + blockUserIds[i], 1);
                        }
                    }
                }
            }
        })
    });

    let BLOCK_MENU_ID;
    let registerBlockMenu = function () {
        let blockLevel = localStorage.getItem(BLOCK_LEVEL_KEY);
        let title = blockLevel ? BLOCK_USER_MENU_TXT : BLOCK_COMMENT_MENU_TXT;
        BLOCK_MENU_ID = GM_registerMenuCommand(`切换屏蔽强度#当前：${title}`, function() {
            if(blockLevel) {
                localStorage.removeItem(BLOCK_LEVEL_KEY);
            } else {
                localStorage.setItem(BLOCK_LEVEL_KEY, 1);
            }
            toggleUserComponentVisibility();
            GM_unregisterMenuCommand(BLOCK_MENU_ID)
            registerBlockMenu();
        });
    }

    registerBlockMenu();

    let settingUserComponentVisibility = function(userComponent) {
        if(localStorage.getItem(BLOCK_LEVEL_KEY)) {
            userComponent.classList.add(DISPLAY_NONE_CLASS);
        } else {
            userComponent.classList.remove(DISPLAY_NONE_CLASS);
        }
    }

    let toggleUserComponentVisibility = function(obj) {
        if(obj) {
            settingUserComponentVisibility(obj)
        } else {
            let userComponents = document.querySelectorAll(`.${USER_COMPONENT_CLASS}.${BLOCKED_CLASS}`)
            if(userComponents.length > 0) {
                for (let i = 0; i < userComponents.length; i++) {
                    settingUserComponentVisibility(userComponents[i])
                }
            }
        }
    }

    let markUserComponent = function(obj, isCancel) {
        let parent = obj.parentElement;
        let index = 0;
        while (!parent.classList.contains(USER_COMPONENT_CLASS) && index < 2) {
            parent = parent.parentElement;
            index++;
        }
        if(parent.classList.contains(USER_COMPONENT_CLASS)) {
            if(isCancel) {
                parent.classList.remove(BLOCKED_CLASS);
            } else {
                parent.classList.add(BLOCKED_CLASS);
            }

            toggleUserComponentVisibility(parent);
        }
    }

    let showCancelUserComment = function(cancelUserId) {
        let hideComponents = document.getElementsByClassName(HIDE_USER_COMMENT_COMPONENT_CLASS + cancelUserId);
        while (hideComponents.length > 0) {
            let hideComponent = hideComponents[0];
            let commentComponents = hideComponent.parentElement.getElementsByClassName(USER_COMMENT_COMPONENT_CLASS);
            if(commentComponents.length > 0) {
                commentComponents[0].innerHTML = hideComponent.innerHTML;
                commentComponents[0].classList.remove(BLOCKED_CLASS);

                markUserComponent(commentComponents[0], true);
            }
            hideComponent.remove();
        }
    }

    let hideAndStoreComment = function(commentComponents) {
        if(commentComponents.length > 0) {
            for (let i = 0; i < commentComponents.length; i++) {
                let commentComponent = commentComponents[i];
                let userId = commentComponent.getAttribute(ATTR_USER_ID);
                let hasBlocked = localStorage.getItem(BLOCK_USER_KEY_PREFIX + userId);
                if(hasBlocked && commentComponent.className.indexOf(BLOCKED_CLASS) === -1) {
                    let hideComponent = document.createElement('div');
                    hideComponent.innerHTML = commentComponent.innerHTML;
                    hideComponent.hidden = true;
                    hideComponent.className = HIDE_USER_COMMENT_COMPONENT_CLASS + userId;

                    commentComponent.innerText = BLOCK_REPLACE_TXT;
                    commentComponent.classList.add(BLOCKED_CLASS);
                    commentComponent.parentElement.appendChild(hideComponent);

                    markUserComponent(commentComponent);
                }
            }
        }
    }

    let hideBlockedUserComment = function(blockUserId) {
        if(!blockUserId) {
            let commentComponents = document.querySelectorAll(`.${USER_COMMENT_COMPONENT_CLASS}:not(.${BLOCKED_CLASS})`)
            hideAndStoreComment(commentComponents);
        } else {
            let blockUserCommentComponents = document.getElementsByClassName(USER_COMMENT_COMPONENT_WITH_ID_CLASS + blockUserId);
            hideAndStoreComment(blockUserCommentComponents);
        }
    }

    let toggleBtn = function(userId, type) {
        let btns = document.getElementsByClassName(TYPE_BTN_CLASS[type] + userId);
        let revertBtns = document.getElementsByClassName(TYPE_BTN_CLASS[1 - type] + userId);
        for (let i = 0; i < btns.length; i++) {
            btns[i].hidden = true;
            revertBtns[i].hidden = false;
        }
    }

    let blockBtnClickEvent = function(e) {
        e.cancelBubble = true;
        e.stopPropagation();

        let userId = e.target.getAttribute(ATTR_USER_ID);
        localStorage.setItem(BLOCK_USER_KEY_PREFIX + userId, 1);

        hideBlockedUserComment(userId);
        toggleBtn(userId, TYPE_BLOCK);
    }

    let cancelBtnClickEvent = function(e) {
        e.cancelBubble = true;
        e.stopPropagation();

        let userId = e.target.getAttribute(ATTR_USER_ID);
        localStorage.removeItem(BLOCK_USER_KEY_PREFIX + userId);

        showCancelUserComment(userId);
        toggleBtn(userId, TYPE_CANCEL);
    }

    let markComponents = function() {
        let commentComponents = document.querySelectorAll(`.${COMMENT_CONTENT_CLASS}:not(.${USER_COMMENT_COMPONENT_CLASS})`)
        if(commentComponents.length > 0) {
            for (let i = 0; i < commentComponents.length; i++) {
                let commentComponent = commentComponents[i];
                let userRightComponent = commentComponent.parentElement;
                let userComponent = userRightComponent.parentElement;

                if(userRightComponent.firstChild) {
                    let userNameComponent = userRightComponent.firstChild.firstChild;
                    if(userNameComponent) {
                        let aTag = userNameComponent.getElementsByTagName('a');
                        if(aTag.length > 0) {
                            let userHref = aTag[0].getAttribute('href');
                            let userId = userHref.substr(userHref.lastIndexOf("/") + 1)

                            userNameComponent.classList.add(USER_NAME_COMPONENT_CLASS);
                            userNameComponent.setAttribute(ATTR_USER_ID, userId);

                            userRightComponent.classList.add(USER_RIGHT_COMPONENT_CLASS);
                            userRightComponent.setAttribute(ATTR_USER_ID, userId);

                            userComponent.classList.add(USER_COMPONENT_CLASS)

                            commentComponent.classList.add(USER_COMMENT_COMPONENT_CLASS);
                            commentComponent.classList.add(USER_COMMENT_COMPONENT_WITH_ID_CLASS + userId);
                            commentComponent.setAttribute(ATTR_USER_ID, userId);
                        }
                    }
                }
            }
        }
    }

    let appendBtn = function(component, userId, type) {
        let hasBlocked = localStorage.getItem(BLOCK_USER_KEY_PREFIX + userId);
        let blockBtn = document.createElement("span");
        blockBtn.setAttribute(ATTR_USER_ID, userId);
        blockBtn.classList.add(BTN_GROUP_CLASS)
        blockBtn.classList.add(TYPE_BTN_CLASS[type] + userId)
        blockBtn.style = TYPE_BTN_STYLE[type];
        blockBtn.innerText = TYPE_BTN_TXT[type];
        blockBtn.onclick = type === 0 ? blockBtnClickEvent : cancelBtnClickEvent;
        blockBtn.hidden = type === 0 ? hasBlocked : !hasBlocked

        component.appendChild(blockBtn);
        component.classList.add(BTN_APPENDED_COMPONENT_CLASS);
    }

    let appendClickBtn = function() {
        let userNameComponents = document.querySelectorAll(`.${USER_NAME_COMPONENT_CLASS}:not(.${BTN_APPENDED_COMPONENT_CLASS})`);
        if(userNameComponents.length > 0) {
            for (let i = 0; i < userNameComponents.length; i++) {
                let userNameComponent = userNameComponents[i];
                let userId = userNameComponent.getAttribute(ATTR_USER_ID);
                if(userNameComponent.getElementsByClassName(BTN_GROUP_CLASS).length === 0) {
                    appendBtn(userNameComponent, userId, TYPE_BLOCK);
                    appendBtn(userNameComponent, userId, TYPE_CANCEL);
                }
            }
        }
    }

    let mainEvent = function() {
        markComponents();
        appendClickBtn();
        hideBlockedUserComment();
    }

    setInterval(mainEvent, INTERVAL_TIME);


})();
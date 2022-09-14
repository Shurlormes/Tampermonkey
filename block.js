const BLOCK_BTN_CLASS = 'shurlormes-block';
const BLOCK_USERS_KEY_PREFIX = 'shurlormes-block-user-';

let app = document.getElementById('app');
let testBtn = document.getElementById('test');
testBtn.onclick = function(e) {
    for (let i = 0; i < 5; i++) {
        let btn = document.createElement('button');
        btn.className = BLOCK_BTN_CLASS;
        btn.innerText = 'Add' + i;
        btn.setAttribute('data-id', i+10);
        btn.onclick = blockBtnClickEvent;
        app.appendChild(btn);

        let btn2 = document.createElement('button');
        btn2.className = BLOCK_BTN_CLASS;
        btn2.innerText = 'Remove' + i;
        btn2.setAttribute('data-id', i+10);
        btn2.onclick = removeBtnClickEvent;
        app.appendChild(btn2);
    }
}


let blockBtnClickEvent = function(e) {
    e.cancelBubble = true;
    e.stopPropagation();

    let id = e.target.getAttribute("data-id");

    if(localStorage.getItem(BLOCK_USERS_KEY_PREFIX + id)) {
        console.log('Has')
    }

    localStorage.setItem(BLOCK_USERS_KEY_PREFIX + id, 1)
}

let removeBtnClickEvent = function(e) {
    e.cancelBubble = true;
    e.stopPropagation();
    let id = e.target.getAttribute("data-id");
    localStorage.removeItem(BLOCK_USERS_KEY_PREFIX + id)
}

//
// setInterval(function() {
//     let blockBtns = document.getElementsByClassName(BLOCK_BTN_CLASS);
//     for (let i = 0; i < blockBtns.length; i++) {
//         let btn = blockBtns[i];
//         btn.onclick = blockBtnClickEvent;
//     }
// }, 100)

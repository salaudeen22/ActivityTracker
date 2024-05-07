'use strict';

document.addEventListener('DOMContentLoaded', function() {
    let page = document.getElementById('buttonDiv');
    const kButtonColors = ['#3a757', '#e8453c', "#f9bb2d", "#4688f1"];

    function constructOptions(kButtonColors) {
        for (let item of kButtonColors) {
            let button = document.createElement('button');
            button.style.backgroundColor = item;
            button.addEventListener('click', function() {
                chrome.storage.sync.set({ color: item }, function() {
                    console.log('Color is set to: ' + item);
                });
            });
            page.appendChild(button);
        }
    }

    constructOptions(kButtonColors);
});
x
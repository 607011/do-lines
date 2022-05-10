(function(window) {
    'use strict';

    const PADDING = { LEFT: 55, RIGHT: 55, TOP: 80, BOTTOM: 130 };
    const DEFAULT = {
        fontSize: JSON.parse(localStorage.getItem('bart_fontSize')) || 14,
        lineSpacing: JSON.parse(localStorage.getItem('bart_lineSpacing')) || 140,
        text: JSON.parse(localStorage.getItem('bart_text')) || 'I should document my code better!',
    }
    let hashParam = Object.assign({}, DEFAULT);

    let input = null;
    let container = null;
    let bgImg = null;
    let bartImg = null;
    let canvas = null;
    let ctx = null;
    let fontSize = null;
    let lineSpacing = null;
    let columnGap = null;

    function draw() {
        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.clientWidth, canvas.clientHeight);
            if (input.value.length > 0) {
                const topPadding = PADDING.TOP * canvas.clientHeight / bgImg.naturalHeight;
                const rightPadding = PADDING.RIGHT * canvas.clientWidth / bgImg.naturalWidth;
                const bottomPadding = PADDING.BOTTOM * canvas.clientHeight / bgImg.naturalHeight;
                const leftPadding = PADDING.LEFT * canvas.clientWidth / bgImg.naturalWidth;
                ctx.font = `${hashParam.fontSize}px "Gochi Hand"`;
                const metrics = ctx.measureText(input.value);
                const innerWidth = canvas.clientWidth - leftPadding - rightPadding;
                const nColumns = Math.floor(innerWidth / metrics.width);
                const gap = (innerWidth - nColumns * metrics.width) / (nColumns-1);
                const lineHeight = 1e-2 * hashParam.lineSpacing * (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
                const nRows = Math.floor((canvas.clientHeight - topPadding - bottomPadding) / lineHeight);
                ctx.fillStyle = '#f8f8f8';
                for (let column = 0; column < nColumns; ++column) {
                    for (let row = 0; row < nRows; ++row) {
                        const x = leftPadding + column * (gap + metrics.width);
                        const y = topPadding + row * lineHeight;
                        ctx.fillText(input.value, x, y);
                    }
                }
                const bartWidth = canvas.clientWidth / bgImg.naturalWidth * bartImg.naturalWidth;
                const bartHeight = canvas.clientHeight / bgImg.naturalHeight * bartImg.naturalHeight;
                ctx.drawImage(bartImg, canvas.clientWidth - bartWidth, canvas.clientHeight - bartHeight, bartWidth, bartHeight);
            }
        }
    }

    function evaluateHash() {
        let data = {};
        for (const param of window.location.hash.substring(1).split(';')) {
            const [key, value] = param.split('=');
            if (key && value) {
                let v = decodeURIComponent(value);
                let number = parseInt(v);
                if (Number.isInteger(number)) {
                    v = number;
                }
                data[key] = v;
            }
        }
        if (data.text !== input.value) {
           input.value = data.text;
           draw();
        }
        if (data.fontSize && data.fontSize !== +fontSize.value) {
            fontSize.value = data.fontSize;
            draw();
        }
        if (data.lineSpacing && data.lineSpacing !== +lineSpacing.value) {
            lineSpacing.value = data.lineSpacing;
            draw();
        }
        updateHash(data);
    }

    function updateHash(obj = {}) {
        hashParam = Object.assign({}, hashParam, obj)
        window.location.hash = '#' + Object.keys(hashParam).map(key => `${key}=${hashParam[key]}`).join(';');
    }

    function onHashChange(e) {
        if (e && e.oldURL !== e.newURL) {
            evaluateHash();
        }
    }

    function onKeyUp() {
        updateHash({ text: input.value });
        draw();
    }

    function onFontSizeChange(_e) {
        updateHash({fontSize: +fontSize.value});
        draw();
    }

    function onLineSpacingChange(_e) {
        updateHash({lineSpacing: +lineSpacing.value});
        draw();
    }

    function onResize() {
        const MARGIN_BOTTOM = 50;
        const imgAspectRatio = bgImg.naturalHeight / bgImg.naturalWidth;
        const windowAspectRatio = (window.innerHeight - MARGIN_BOTTOM) / window.innerWidth;
        if (imgAspectRatio < windowAspectRatio) {
            canvas.width = container.clientWidth;
            canvas.height = Math.floor(container.clientWidth * imgAspectRatio);
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
        }
        else {
            canvas.width = Math.floor((window.innerHeight - MARGIN_BOTTOM) / imgAspectRatio);
            canvas.height = window.innerHeight - MARGIN_BOTTOM;
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
        }
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        draw();
    }

    function main() {
        input = document.querySelector('input#text');
        input.focus();
        input.addEventListener('keyup', onKeyUp);
        container = document.querySelector('#chalkboard');
        canvas = document.querySelector('#chalkboard > canvas');
        ctx = canvas.getContext('2d');
        bartImg = (function(img) {
            img.src = 'images/bart.png';
            img.onload = function() {
                bgImg = (function(img) {
                    img.src = 'images/chalkboard-3840w.png';
                    img.onload = onResize;
                    return img;
                })(new Image());
            };
            return img;
        })(new Image());
        window.addEventListener('resize', onResize);
        const downloadLink = document.querySelector('a#download');
        downloadLink.addEventListener('click', () => {
            const image = canvas.toDataURL('image/png');
            downloadLink.href = image;
        });
        fontSize = document.querySelector('#font-size');
        fontSize.addEventListener('change', onFontSizeChange);
        lineSpacing = document.querySelector('#line-spacing');
        lineSpacing.addEventListener('change', onLineSpacingChange);
        evaluateHash();
    }

    window.addEventListener('load', () => {
        window.addEventListener('hashchange', onHashChange);
        document.fonts.ready.then(main);
    });
})(window)
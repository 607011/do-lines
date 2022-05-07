(function(window) {
    'use strict';

    const COLUMN_GAP = 20;
    const PADDING = { LEFT: 20, RIGHT: 50, TOP: 30, BOTTOM: 60 };
    const DEFAULT = {
        fontSize: JSON.parse(localStorage.getItem('bart_FontSize')) || 14,
        lineHeightFactor: JSON.parse(localStorage.getItem('bart_LineHeightFactor')) || 1.4,
        text: JSON.parse(localStorage.getItem('bart_Text')) || 'I should document my code better!',
    }
    let hashParam = Object.assign({}, DEFAULT);

    let input = null;
    let container = null;
    let bg_img = null;
    let canvas = null;
    let ctx = null;

    const evaluateHash = () => {
        let data = {};
        for (const param of window.location.hash.substring(1).split(';')) {
            const [key, value] = param.split('=');
            if (key && value) {
                data[key] = decodeURIComponent(value);
            }
        }
        if (data.text !== input.value) {
           input.value = data.text;
           draw();
        }
        updateHash(data);
    };

    function updateHash(obj = {}) {
        const newHashParam = Object.assign({}, hashParam, obj)
        window.location.hash = '#' + Object.keys(newHashParam).map(key => `${key}=${newHashParam[key]}`).join(';');
    };

    function onHashChange(e) {
        if (e && e.oldURL !== e.newURL) {
            evaluateHash();
        }
    };

    function draw() {
        ctx.drawImage(bg_img, 0, 0, canvas.clientWidth, canvas.clientHeight);
        if (input.value.length > 0) {
            ctx.font = `${hashParam.fontSize}px "Gochi Hand"`;
            const metrics = ctx.measureText(input.value);
            const nColumns = Math.floor((canvas.clientWidth - PADDING.LEFT - PADDING.RIGHT) / (metrics.width + COLUMN_GAP));
            const lineHeight = hashParam.lineHeightFactor * (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
            const nRows = Math.floor((canvas.clientHeight - PADDING.TOP - PADDING.BOTTOM) / lineHeight);
            ctx.fillStyle = '#f8f8f8';
            for (let column = 0; column < nColumns; ++column) {
                for (let row = 0; row < nRows; ++row) {
                    const x = PADDING.LEFT + column * (COLUMN_GAP + metrics.width);
                    const y = PADDING.TOP + row * lineHeight;
                    ctx.fillText(input.value, x, y);
                }
            }
        }
    };

    function onResize() {
        const PAD_BOTTOM = 50;
        const imgAspectRatio = bg_img.naturalHeight / bg_img.naturalWidth;
        const windowAspectRatio = (window.innerHeight - PAD_BOTTOM) / window.innerWidth;
        if (imgAspectRatio < windowAspectRatio) {
            canvas.width = container.clientWidth;
            canvas.height = Math.floor(container.clientWidth * imgAspectRatio);
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
        }
        else {
            canvas.width = Math.floor((window.innerHeight - PAD_BOTTOM) / imgAspectRatio);
            canvas.height = window.innerHeight - PAD_BOTTOM;
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
        }
        ctx.drawImage(bg_img, 0, 0, canvas.width, canvas.height);
        draw();
    };

    function onKeyUp() {
        updateHash({ text: input.value });
        draw();
    }

    function main() {
        input = document.querySelector('#input-container input');
        input.focus();
        input.addEventListener('keyup', onKeyUp);
        container = document.querySelector('#chalkboard');
        canvas = document.querySelector('#chalkboard > canvas');
        ctx = canvas.getContext('2d');
        bg_img = (function() {
            const img = new Image();
            img.src = 'chalkboard-3840w.png';
            return img;
        })();
        bg_img.onload = onResize;
        window.addEventListener('resize', onResize);
        const downloadLink = document.querySelector('a#download');
        downloadLink.addEventListener('click', () => {
            const image = canvas.toDataURL('image/png');
            downloadLink.href = image;
        });
        evaluateHash();
    };

    window.addEventListener('load', () => {
        window.addEventListener('hashchange', onHashChange);
        document.fonts.ready.then(main);
    });
})(window)
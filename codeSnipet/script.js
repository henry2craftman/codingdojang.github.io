// script.js (Split.js 초기화 부분만)
document.addEventListener('DOMContentLoaded', () => {
    // ... (다른 초기화 코드)

    if (window.innerWidth > 768) { // 데스크탑 뷰
        // 1. 에디터 패널 vs 미리보기 패널 (수평 분할)
        if (document.getElementById('editor-area') && document.getElementById('preview-area')) {
            Split(['#editor-area', '#preview-area'], {
                sizes: [35, 65],       // 에디터 35%, 미리보기 65%
                minSize: [250, 300],
                gutterSize: 10,
                direction: 'horizontal',
                cursor: 'col-resize'
            });
        }

        // 2. 에디터 패널 내부 (HTML, CSS, JS 에디터 수직 분할)
        if (document.getElementById('html-panel') && document.getElementById('css-panel') && document.getElementById('js-panel')) {
            Split(['#html-panel', '#css-panel', '#js-panel'], {
                sizes: [33, 34, 33],   // 각 에디터 높이 균등 분할
                                      // "높이 간격을 반으로"라는 의미가 이 비율을 조정하는 것이라면
                                      // 예: [20, 20, 60] (HTML,CSS는 작게, JS는 크게) 등으로 변경
                minSize: 40,
                gutterSize: 10,
                direction: 'vertical',
                cursor: 'row-resize',
                elementStyle: (dimension, size, gutterSize) => ({
                    'flex-basis': `calc(${size}% - ${gutterSize}px)`,
                }),
                gutterStyle: (dimension, gutterSize) => ({
                    'flex-basis': `${gutterSize}px`,
                })
            });
        }
    } else { // 모바일 뷰
        console.log("Mobile view: Split.js not initialized or gutters hidden by CSS.");
    }

    // ... (나머지 script.js 로직)
    if (window.htmlEditor) window.htmlEditor.setValue(`<h1>안녕하세요! 👋</h1>\n<p class="greeting">\n  코딩도장에서 코드를 연습하세요!\n</p>\n<button id="myButtonInPreview" onclick="sayHello()">\n  클릭!\n</button>`);
     if (window.cssEditor) window.cssEditor.setValue(`body {\n  font-family: sans-serif;\n  color: #333;\n  margin: 20px;\n}\n.greeting {\n  color: steelblue;\n  font-size: 20px;\n}\nbutton {\n  padding: 10px;\n  background-color: lightgreen;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}`);
     if (window.jsEditor) window.jsEditor.setValue(`let clickCounter = 0;\nfunction sayHello() {\n  clickCounter++;\n  console.log('Hello from console.log! Click #' + clickCounter);\n}\n`);
 });
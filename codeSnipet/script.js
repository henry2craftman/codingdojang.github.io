// script.js
document.addEventListener('DOMContentLoaded', () => {
    const editorOptions = {
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        theme: 'material',
        lint: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers"],
        lineWrapping: false
    };

    window.htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), { ...editorOptions, mode: 'htmlmixed' });
    window.cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), { ...editorOptions, mode: 'css' });
    window.jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), { ...editorOptions, mode: 'javascript' });

    const previewFrame = document.getElementById('preview-frame');
    const runButton = document.getElementById('run-button');
    const terminalOutput = document.querySelector('#web-terminal .terminal-output');
    // --- 스크롤 대상으로 사용할 요소들 ---
    const previewPane = document.getElementById('preview-area'); // 미리보기 패널
    const terminalContainer = document.getElementById('web-terminal-container'); // 웹 터미널 컨테이너
    // ----------------------------------

    function clearTerminal() {
        if (terminalOutput) {
            terminalOutput.innerHTML = '';
        }
    }

    window.appendToTerminal = function(message, type = 'log') {
        if (terminalOutput) {
            const newLine = document.createElement('p');
            newLine.textContent = message;
            terminalOutput.appendChild(newLine);
            terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
        } else {
            // console.warn("Web terminal output element not found."); // 너무 자주 나올 수 있어 주석 처리
        }
    }

    if (terminalOutput) {
        window.appendToTerminal('Web Terminal Initialized (console.log will be captured).');
    }

    function updatePreview() {
        if (!window.htmlEditor || !window.cssEditor || !window.jsEditor) {
            // console.error("One or more main editors are not initialized.");
            return;
        }
        const html = window.htmlEditor.getValue();
        const css = window.cssEditor.getValue();
        const jsFromEditor = window.jsEditor.getValue();

        const source = `
            <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview</title><style>${css}</style></head>
            <body>
                ${html}
                <script>
                    (function() { /* console.log 가로채기 로직 ... 이전과 동일 ... */
                        const originalConsoleLog = console.log; const originalConsoleError = console.error; const originalConsoleWarn = console.warn;
                        console.log = function(...args) {
                            if (window.parent && typeof window.parent.appendToTerminal === 'function') {
                                window.parent.appendToTerminal(args.map(String).join(' '), 'log');
                            }
                            originalConsoleLog.apply(console, args);
                        };
                        console.error = function(...args) {
                            if (window.parent && typeof window.parent.appendToTerminal === 'function') {
                                window.parent.appendToTerminal('ERROR: ' + args.map(String).join(' '), 'error');
                            }
                            originalConsoleError.apply(console, args);
                        };
                        console.warn = function(...args) {
                            if (window.parent && typeof window.parent.appendToTerminal === 'function') {
                                window.parent.appendToTerminal('WARN: ' + args.map(String).join(' '), 'warn');
                            }
                            originalConsoleWarn.apply(console, args);
                        };
                        window.onerror = function(message, source, lineno, colno, error) {
                           if (window.parent && typeof window.parent.appendToTerminal === 'function') {
                               let errorMessage = 'Uncaught Exception: ' + message;
                               if (source) errorMessage += ' at ' + source.substring(source.lastIndexOf('/') + 1);
                               if (lineno) errorMessage += ':' + lineno; if (colno) errorMessage += ':' + colno;
                               window.parent.appendToTerminal(errorMessage, 'error');
                           }
                           return false;
                        };
                    })();
                    try { ${jsFromEditor} } catch (e) { console.error("Error executing user script:", e.message); }
                <\/script>
            </body></html>`;
        previewFrame.srcdoc = source;
        // console.log('Preview updated. iframe console.log is captured.');
    }

    if (runButton) {
        runButton.addEventListener('click', () => {
            clearTerminal();
            window.appendToTerminal('Executing new code...');
            updatePreview();

            // --- 모바일에서 결과 영역으로 스크롤 ---
            // 화면 너비가 768px 이하일 때 (style.css의 모바일 브레이크포인트와 일치)
            if (window.innerWidth <= 768) {
                // 어떤 요소를 우선적으로 보여줄지 결정
                // 1. 미리보기 프레임이 있고 내용이 업데이트 되었다면 미리보기로
                // 2. 또는 항상 터미널을 먼저 보여주거나
                // 여기서는 터미널을 우선적으로 보여준다고 가정합니다.
                // previewPane이나 terminalContainer 중 하나를 선택하여 스크롤합니다.
                // 둘 다 결과 영역이므로, 사용자가 가장 보고 싶어할 만한 곳으로.

                let targetElement = terminalContainer; // 기본은 터미널
                // 만약 미리보기 패널이 더 중요하다고 판단되면:
                // if (previewPane && previewPane.style.display !== 'none') { // 미리보기가 보이는 상태라면
                //    targetElement = previewPane;
                // }

                if (targetElement) {
                    setTimeout(() => { // DOM 업데이트 및 렌더링 후 스크롤
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        console.log(`Scrolled to ${targetElement.id || 'target element'} on mobile.`);
                    }, 150); // 딜레이 시간은 실제 환경에 따라 조절 (100-250ms 정도)
                }
            }
            // ------------------------------------
        });
    } else {
        console.warn("Run button with ID 'run-button' not found.");
    }

    // Split.js 초기화 (이전 답변에서 수정한 내용으로 적용 필요)
    // 예시:
    if (document.getElementById('editor-area') && document.getElementById('preview-area')) {
        Split(['#editor-area', '#preview-area'], {
            sizes: [60, 40], gutterSize: 10, minSize: [250, 150],
            cursor: 'col-resize', direction: 'horizontal'
        });
    }
    if (document.getElementById('html-panel') && document.getElementById('css-panel') && document.getElementById('js-panel')) {
        Split(['#html-panel', '#css-panel', '#js-panel'], {
            sizes: [33, 34, 33], gutterSize: 10, minSize: 50,
            cursor: 'row-resize', direction: 'vertical',
            elementStyle: (dimension, size, gutterSize) => ({ 'flex-basis': `calc(${size}% - ${gutterSize}px)` }),
            gutterStyle: (dimension, gutterSize) => ({ 'flex-basis': `${gutterSize}px` })
        });
    }


    // Playwright 스크립트 에디터 초기화
    if (document.getElementById('playwright-code-display')) {
        window.playwrightScriptEditor = CodeMirror.fromTextArea(document.getElementById('playwright-code-display'), {
            lineNumbers: true, matchBrackets: true, theme: 'material',
            mode: 'javascript', readOnly: true, lineWrapping: false
        });
    }

    // 초기 코드 설정
    if (window.htmlEditor) window.htmlEditor.setValue(`<h1>안녕하세요! 👋</h1>\n<p class="greeting">\n  코딩도장에서 코드를 연습하세요!\n</p>\n<button id="myButtonInPreview" onclick="sayHello()">\n  클릭!\n</button>`);
    if (window.cssEditor) window.cssEditor.setValue(`body {\n  font-family: sans-serif;\n  color: #333;\n  margin: 20px;\n}\n.greeting {\n  color: steelblue;\n  font-size: 20px;\n}\nbutton {\n  padding: 10px;\n  background-color: lightgreen;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}`);
    if (window.jsEditor) window.jsEditor.setValue(`let clickCounter = 0;
function sayHello() {
  clickCounter++;
  console.log('Hello from console.log! Click #' + clickCounter);
}

// 초기 JS 로드 시 메시지는 script.js에서 직접 터미널에 찍으므로, 여기서는 생략하거나 다른 메시지로.
// console.log('Initial JavaScript (from setValue) loaded.');
`);

    // DOMContentLoaded 시 자동 updatePreview() 호출은 Playwright의 첫번째 run-button 클릭으로 대체
    // updatePreview();

    console.log('Code editor (script.js with mobile scroll) initialized.');
});
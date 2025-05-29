// script.js
document.addEventListener('DOMContentLoaded', () => {
    const editorOptions = { /* ... 이전과 동일 ... */
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

    // --- 웹 터미널 초기화 함수 ---
    function clearTerminal() {
        if (terminalOutput) {
            terminalOutput.innerHTML = ''; // 터미널 내용 비우기
            // window.appendToTerminal('Terminal cleared.'); // 초기화 메시지 (선택 사항)
        }
    }
    // ---------------------------

    // 웹 터미널에 메시지를 추가하는 함수
    window.appendToTerminal = function(message, type = 'log') {
        if (terminalOutput) {
            const newLine = document.createElement('p');
            newLine.textContent = message;
            terminalOutput.appendChild(newLine);
            terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
        } else {
            console.warn("Web terminal output element not found.");
        }
    }
    if (terminalOutput) {
        window.appendToTerminal('Web Terminal Initialized (console.log will be captured).');
    }

    function updatePreview() {
        if (!window.htmlEditor || !window.cssEditor || !window.jsEditor) {
            console.error("One or more main editors are not initialized.");
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
                        const originalConsoleLog = console.log;
                        const originalConsoleError = console.error;
                        const originalConsoleWarn = console.warn;
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
                               if (lineno) errorMessage += ':' + lineno;
                               if (colno) errorMessage += ':' + colno;
                               window.parent.appendToTerminal(errorMessage, 'error');
                           }
                           return false;
                        };
                    })();
                    try { ${jsFromEditor} } catch (e) { console.error("Error executing user script:", e.message); }
                <\/script>
            </body></html>`;
        previewFrame.srcdoc = source;
        console.log('Preview updated. iframe console.log is captured.');
    }

    if (runButton) {
        runButton.addEventListener('click', () => {
            // --- 실행 버튼 클릭 시 터미널 초기화 ---
            clearTerminal();
            // 터미널 초기화 후, 약간의 딜레이를 주고 updatePreview를 호출하여
            // "Terminal cleared" 메시지가 너무 빨리 사라지는 것을 방지할 수 있습니다 (선택 사항).
            // setTimeout(() => {
            //     window.appendToTerminal('Executing new code...'); // 실행 시작 메시지 (선택 사항)
            //     updatePreview();
            // }, 50);
            window.appendToTerminal('Executing new code...'); // 또는 바로 실행 메시지
            updatePreview();
            // ------------------------------------
        });
    } else {
        console.warn("Run button with ID 'run-button' not found.");
    }

    // Playwright 스크립트 에디터 초기화 (이전과 동일)
    // ...

    // 초기 코드 설정 (이전과 동일, JS는 console.log 사용)
    if (window.htmlEditor) window.htmlEditor.setValue(`<h1>안녕하세요! 👋</h1>\n<p class="greeting">\n  코딩도장에서 코드를 연습하세요!\n</p>\n<button id="myButtonInPreview" onclick="sayHello()">\n  클릭!\n</button>`);
    if (window.cssEditor) window.cssEditor.setValue(`body {\n  font-family: sans-serif;\n  color: #333;\n  margin: 20px;\n}\n.greeting {\n  color: steelblue;\n  font-size: 20px;\n}\nbutton {\n  padding: 10px;\n  background-color: lightgreen;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}`);
    if (window.jsEditor) window.jsEditor.setValue(`let clickCounter = 0;
function sayHello() {
  clickCounter++;
  console.log('Hello from console.log! Click #' + clickCounter);
}
`);
});
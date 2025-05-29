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
    const previewPane = document.getElementById('preview-area'); // 모바일 스크롤용
    const terminalContainer = document.getElementById('web-terminal-container'); // 모바일 스크롤용

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
            // console.warn("Web terminal output element not found.");
        }
    }

    if (terminalOutput) {
        window.appendToTerminal('Web Terminal Initialized (console.log will be captured).');
    }


    // --- Split.js 초기화 ---
    if (window.innerWidth > 768) { // 데스크탑 뷰에서만 특정 비율로 Split.js 적용
        // 1. 메인 콘텐츠 (에디터 그룹 vs 미리보기) 수평 분할
        if (document.getElementById('editor-area') && document.getElementById('preview-area')) {
            Split(['#editor-area', '#preview-area'], {
                sizes: [35, 65],       // <<--- 에디터 35%, 미리보기 65%로 너비 조정
                minSize: [250, 300],   // 최소 너비 (에디터, 미리보기)
                gutterSize: 10,
                direction: 'horizontal',
                cursor: 'col-resize'
            });
        } else {
            console.warn("Split.js: editor-area or preview-area not found for main horizontal split.");
        }

        // 2. 에디터 패널 내부 (HTML, CSS, JS) 수직 분할
        if (document.getElementById('html-panel') && document.getElementById('css-panel') && document.getElementById('js-panel')) {
            Split(['#html-panel', '#css-panel', '#js-panel'], {
                sizes: [33, 34, 33],   // HTML, CSS, JS 에디터 초기 높이 비율 (균등)
                                       // "높이 간격을 반으로"는 사용자가 드래그로 조절하거나,
                                       // minSize를 더 작게 설정하여 매우 작게 만들 수 있도록 함.
                                       // 또는 이 sizes 배열 값을 [20, 20, 60] 등으로 변경하여
                                       // 특정 에디터의 초기 높이를 더 작게 할 수 있음.
                minSize: 40,           // 각 코드 섹션 최소 높이
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
        } else {
            console.warn("Split.js: One or more code panels not found for vertical editor split.");
        }
    } else { // 모바일 뷰에서는 Split.js를 초기화하지 않거나 다르게 처리
        console.log("Mobile view: Split.js gutters are hidden by CSS.");
        // CSS에서 .gutter { display: none !important; } 로 처리하므로,
        // JS에서 Split.js를 초기화해도 구분선은 보이지 않음.
        // 만약 모바일에서 Split 기능을 완전히 비활성화하고 싶다면,
        // Split 인스턴스를 저장했다가 destroy() 하거나, 이 if 블록 밖에서 초기화하지 않도록.
        // 현재 CSS는 모바일에서 flex-direction: column으로 레이아웃을 변경하므로,
        // 데스크탑용 Split.js 설정이 모바일 레이아웃에 직접적인 방해는 되지 않음 (gutter가 숨겨지므로).
    }
    // ------------------------


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
                    (function() { /* console.log 가로채기 로직 ... */
                        const oL=console.log,oE=console.error,oW=console.warn;
                        console.log=(...a)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function')window.parent.appendToTerminal(a.map(String).join(' '),'log');oL.apply(console,a);};
                        console.error=(...a)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function')window.parent.appendToTerminal('ERROR: '+a.map(String).join(' '),'error');oE.apply(console,a);};
                        console.warn=(...a)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function')window.parent.appendToTerminal('WARN: '+a.map(String).join(' '),'warn');oW.apply(console,a);};
                        window.onerror=(m,s,l,c,e)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function'){let em='Uncaught Exception: '+m;if(s)em+=' at '+s.substring(s.lastIndexOf('/')+1);if(l)em+=':'+l;if(c)em+=':'+c;window.parent.appendToTerminal(em,'error');}return false;};
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

            if (window.innerWidth <= 768) {
                let targetElement = terminalContainer; // 모바일에서는 터미널을 우선 스크롤
                // if (previewPane && previewPane.offsetParent !== null) targetElement = previewPane; // 또는 미리보기
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                }
            }
        });
    } else {
        console.warn("Run button with ID 'run-button' not found.");
    }

    if (document.getElementById('playwright-code-display')) {
        window.playwrightScriptEditor = CodeMirror.fromTextArea(document.getElementById('playwright-code-display'), {
            lineNumbers: true, matchBrackets: true, theme: 'material',
            mode: 'javascript', readOnly: true, lineWrapping: false
        });
    }

    if (window.htmlEditor) window.htmlEditor.setValue(`<h1>안녕하세요! 👋</h1>\n<p class="greeting">\n  코딩도장에서 코드를 연습하세요!\n</p>\n<button id="myButtonInPreview" onclick="sayHello()">\n  클릭!\n</button>`);
    if (window.cssEditor) window.cssEditor.setValue(`body {\n  font-family: sans-serif;\n  color: #333;\n  margin: 20px;\n}\n.greeting {\n  color: steelblue;\n  font-size: 20px;\n}\nbutton {\n  padding: 10px;\n  background-color: lightgreen;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}`);
    if (window.jsEditor) window.jsEditor.setValue(`let clickCounter = 0;\nfunction sayHello() {\n  clickCounter++;\n  console.log('Hello from console.log! Click #' + clickCounter);\n}\n\nconsole.log('Initial JavaScript (from setValue) loaded.');`);


    console.log('Code editor (script.js with desktop/mobile split logic) initialized.');
});
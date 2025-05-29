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
    const previewPane = document.getElementById('preview-area');
    const terminalContainer = document.getElementById('web-terminal-container');

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
        }
    }

    if (terminalOutput) {
        window.appendToTerminal('Web Terminal Initialized (console.log will be captured).');
    }

    // Split.js 초기화
    if (window.innerWidth > 768) { // 데스크탑 뷰
        if (document.getElementById('editor-area') && document.getElementById('preview-area')) {
            Split(['#editor-area', '#preview-area'], {
                sizes: [35, 65], // 에디터 35%, 미리보기 65%
                minSize: [250, 300],
                gutterSize: 10,
                direction: 'horizontal',
                cursor: 'col-resize'
            });
        }
        if (document.getElementById('html-panel') && document.getElementById('css-panel') && document.getElementById('js-panel')) {
            Split(['#html-panel', '#css-panel', '#js-panel'], {
                sizes: [33, 34, 33], // 에디터 내부 균등 분할
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

    function updatePreview() {
        if (!window.htmlEditor || !window.cssEditor || !window.jsEditor) return;
        const html = window.htmlEditor.getValue();
        const css = window.cssEditor.getValue();
        const jsFromEditor = window.jsEditor.getValue();
        const source = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview</title><style>${css}</style></head><body>${html}<script>(function(){const oL=console.log,oE=console.error,oW=console.warn;console.log=(...a)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function')window.parent.appendToTerminal(a.map(String).join(' '),'log');oL.apply(console,a);};console.error=(...a)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function')window.parent.appendToTerminal('ERROR: '+a.map(String).join(' '),'error');oE.apply(console,a);};console.warn=(...a)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function')window.parent.appendToTerminal('WARN: '+a.map(String).join(' '),'warn');oW.apply(console,a);};window.onerror=(m,s,l,c,e)=>{if(window.parent&&typeof window.parent.appendToTerminal==='function'){let em='Uncaught Exception: '+m;if(s)em+=' at '+s.substring(s.lastIndexOf('/')+1);if(l)em+=':'+l;if(c)em+=':'+c;window.parent.appendToTerminal(em,'error');}return false;};})();try{${jsFromEditor}}catch(e){console.error("Error executing user script:",e.message);}<\/script></body></html>`;
        previewFrame.srcdoc = source;
    }

    if (runButton) {
        runButton.addEventListener('click', () => {
            clearTerminal();
            window.appendToTerminal('Executing new code...');
            updatePreview();
            if (window.innerWidth <= 768) {
                let targetElement = previewPane; // 모바일: 실행 후 미리보기로 스크롤
                if (terminalContainer && terminalOutput.textContent.toLowerCase().includes('error')) {
                    targetElement = terminalContainer; // 에러 있으면 터미널로
                }
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                }
            }
        });
    }

    if (document.getElementById('playwright-code-display')) {
        window.playwrightScriptEditor = CodeMirror.fromTextArea(document.getElementById('playwright-code-display'), {
            lineNumbers: true, matchBrackets: true, theme: 'material',
            mode: 'javascript', readOnly: true, lineWrapping: false
        });
    }

    // 초기 코드 설정
    if (window.htmlEditor) window.htmlEditor.setValue(`<h1>안녕하세요! 👋</h1>\n<p class="greeting">\n  코딩도장에서 코드를 연습하세요!\n</p>\n<button id="myButtonInPreview" onclick="sayHello()">\n  클릭!\n</button>`);
    if (window.cssEditor) window.cssEditor.setValue(`body {\n  font-family: sans-serif;\n  color: #333;\n  margin: 20px;\n}\n.greeting {\n  color: steelblue;\n  font-size: 20px;\n}\nbutton {\n  padding: 10px;\n  background-color: lightgreen;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n}`);
    if (window.jsEditor) window.jsEditor.setValue(`let clickCounter = 0;\nfunction sayHello() {\n  clickCounter++;\n  console.log('Hello from console.log! Click #' + clickCounter);\n}\n\nconsole.log('Initial JavaScript (from setValue) loaded.');`);

    console.log('Code editor (Final Setup) initialized.');
});
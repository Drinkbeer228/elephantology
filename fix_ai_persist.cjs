const fs = require('fs');
let code = fs.readFileSync('src/components/AIChatModal.tsx', 'utf8');

const target1 = "    // Check if there was existing state we should grab from vanilla\\n    if (win.aiChatHistory && Array.isArray(win.aiChatHistory) && win.aiChatHistory.length > 0) {\\n      setMessages([...win.aiChatHistory]);\\n    }";
const replace1 = "    const saved = sessionStorage.getItem('aiChatHistory');\\n    if (saved) {\\n      try { setMessages(JSON.parse(saved)); } catch(e) {}\\n    } else if (win.aiChatHistory && Array.isArray(win.aiChatHistory) && win.aiChatHistory.length > 0) {\\n      setMessages([...win.aiChatHistory]);\\n    }";

// wait, string literals need proper matching. I'll just use Regex.
code = code.replace(/if \(win.aiChatHistory[^}]+\}\n/s, `const saved = sessionStorage.getItem('aiChatHistory');
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch(e) {}
    } else if (win.aiChatHistory && Array.isArray(win.aiChatHistory)) {
      setMessages([...win.aiChatHistory]);
    }
`);

const target2 = "    win.aiChatHistory = messages;";
const replace2 = "    win.aiChatHistory = messages;\n    sessionStorage.setItem('aiChatHistory', JSON.stringify(messages));";
code = code.replace(target2, replace2);

const target3 = "      win.aiChatHistory = [];";
const replace3 = "      win.aiChatHistory = [];\n      sessionStorage.removeItem('aiChatHistory');";
code = code.replace(target3, replace3);

fs.writeFileSync('src/components/AIChatModal.tsx', code);

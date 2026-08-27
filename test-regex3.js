const text = "Тут есть аллометрия и еще аллометрический рост. А тут [аллометрия](link). И sSH, и LF.";
const terms = {
  "sSH": "shoulder height",
  "LF": "locomotor function",
  "аллометри": "непропорциональный рост"
};

let newContent = text;
Object.entries(terms).forEach(([term, def]) => {
  const regex = new RegExp(`(^|[^а-яёa-z0-9_])(${term}[а-яёa-z]*)(?=[^а-яёa-z0-9_]|$)`, 'i');
  // to avoid replacing inside links, we can do a naive check:
  // let's just do it simple for now, since this is a quick glossary
  const match = newContent.match(regex);
  if (match && match.index !== undefined) {
    const fullMatch = match[0];
    const prefix = match[1];
    const word = match[2];
    const startIndex = match.index + prefix.length;
    
    // Check if inside bracket: very simple check, count '[' and ']' before it
    const before = newContent.substring(0, startIndex);
    const openBrackets = (before.match(/\[/g) || []).length;
    const closeBrackets = (before.match(/\]/g) || []).length;
    
    if (openBrackets === closeBrackets) {
      newContent = newContent.substring(0, startIndex) + 
                   `<abbr title="${def}" class="tooltip">${word}</abbr>` + 
                   newContent.substring(startIndex + word.length);
    }
  }
});
console.log(newContent);

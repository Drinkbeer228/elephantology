const text = "Тут есть аллометрия и еще аллометрический рост. А тут [аллометрия](link). И sSH, и LF.";
const terms = {
  "sSH": "shoulder height (высота в холке)",
  "LF": "locomotor function (локомоторная функция)",
  "аллометри": "непропорциональный рост частей тела"
};

let newContent = text;
Object.entries(terms).forEach(([term, def]) => {
  const regex = new RegExp(`(?<!\\[[^\\]]*)\\b(${term}[а-яa-z]*)\\b(?![^\\[]*\\])`, 'i');
  const match = newContent.match(regex);
  if (match && match.index !== undefined) {
    newContent = newContent.substring(0, match.index) + 
                 `<abbr title="${def}" class="tooltip">${match[0]}</abbr>` + 
                 newContent.substring(match.index + match[0].length);
  }
});
console.log(newContent);

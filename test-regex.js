const mdContent = `
Some text
## Связанные знания (Related Knowledge)

*   **[Proboscidea Early Evolution](proboscidea-early-evolution-and-stem-groups.md)** — Филогенетические корни хоботных в палеогене: от базальных афротериев к меритериям.
*   **[Skeletal System Cranial](../anatomy/skeletal_system_cranial.md)** — Сравнительная остеология черепа, краниальная пневматизация и эволюция резцов.

## Сноски (Footnotes)
`;

const match = mdContent.match(/##\s*Связанные знания[^\n]*\n([\s\S]*?)(?=##|$)/i);
if (match) {
  console.log("MATCH:", match[1]);
}

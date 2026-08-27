import re

with open('src/main.tsx', 'r') as f:
    code = f.read()

# Replace the showFootnoteModal function entirely
regex_modal = r"function showFootnoteModal\(htmlContent: string\) \{[\s\S]*?modal\.style\.display = 'flex';\n\}"

popover_code = """let activePopover: HTMLElement | null = null;

function showFootnotePopover(htmlContent: string, link: HTMLElement) {
  if (activePopover) {
    const isSame = activePopover.getAttribute('data-trigger') === link.id;
    activePopover.remove();
    activePopover = null;
    if (isSame) return;
  }

  if (!link.id) link.id = 'fn-link-' + Math.random().toString(36).substring(2);

  const popover = document.createElement('div');
  popover.className = 'fixed sm:absolute z-[99999] bg-[#181a24] sm:border border-t border-[#34384a] sm:rounded-2xl rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] sm:shadow-2xl p-5 text-gray-200 text-sm animate-fade-in bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-auto sm:max-w-md sm:w-max';
  popover.setAttribute('data-trigger', link.id);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'absolute top-3 right-3 text-gray-500 hover:text-white transition-colors p-1 cursor-pointer';
  closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  
  const body = document.createElement('div');
  body.className = 'prose prose-invert max-w-none prose-a:text-kingdom-gold prose-p:leading-relaxed prose-p:mb-0 pr-6 text-[13px] text-gray-300';
  body.innerHTML = htmlContent;
  
  const backrefs = body.querySelectorAll('.footnote-backref');
  backrefs.forEach(el => el.remove());

  popover.appendChild(closeBtn);
  popover.appendChild(body);
  document.body.appendChild(popover);
  
  if (window.innerWidth >= 640) {
    const rect = link.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    let top = rect.bottom + scrollTop + 8;
    let left = rect.left - 20;
    
    // Wait until appended to get dimensions
    const popRect = popover.getBoundingClientRect();
    if (left + popRect.width > window.innerWidth - 16) {
       left = window.innerWidth - popRect.width - 16;
    }
    if (left < 16) left = 16;
    popover.style.top = top + 'px';
    popover.style.left = left + 'px';
  }

  activePopover = popover;

  const closeHandler = (e: MouseEvent) => {
    if (!popover.contains(e.target as Node) && e.target !== link) {
      popover.remove();
      activePopover = null;
      document.removeEventListener('click', closeHandler);
      document.removeEventListener('keydown', keyHandler);
    }
  };

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      popover.remove();
      activePopover = null;
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('click', closeHandler);
    }
  };

  closeBtn.addEventListener('click', () => {
      popover.remove();
      activePopover = null;
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('click', closeHandler);
  });

  setTimeout(() => {
    document.addEventListener('click', closeHandler);
    document.addEventListener('keydown', keyHandler);
  }, 10);
}"""

code = re.sub(regex_modal, popover_code, code)

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Done modal replace")

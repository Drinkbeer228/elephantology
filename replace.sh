sed -i '1596,1768c\
    function parseSimpleMarkdown(md) {\
      if (!md) return "";\
      let html = md;\
      html = html.replace(/^---[\\s\\S]*?---\\s*/, "");\
      html = html.replace(/^(title|description|category|layout|author|date|tags|toc|comments)\\s*:\\s*".*?"\\s*$/gim, "");\
      html = html.replace(/^(title|description|category|layout|author|date|tags|toc|comments)\\s*:\\s*'"'"'.*?'"'"'\\s*$/gim, "");\
      html = html.replace(/^(title|description|category|layout|author|date|tags|toc|comments)\\s*:\\s*.*$/gim, "");\
      html = html.replace(/\\{:?\\s*#[a-zA-Z0-9_-]+\\s*\\}/g, "");\
      html = html.replace(/\\{:?\\s*\\.[a-zA-Z0-9_-]+\\s*\\}/g, "");\
      html = html.replace(/\\{:?\\s*[^}]*\\}/g, "");\
      html = html.replace(/\\[sketchfab\\]\\((https?:\\/\\/sketchfab\\.com\\/(?:3d-models|models)\\/[a-zA-Z0-9-]*?([a-zA-Z0-9]{32}))\\)/g, (match, url, id) => {\
          return `<div class="sketchfab-embed-wrapper my-6 w-full aspect-video rounded-xl overflow-hidden border border-kingdom-border shadow-lg bg-black"><iframe class="w-full h-full" title="3D Model" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" src="https://sketchfab.com/models/${id}/embed?autostart=0&ui_theme=dark"></iframe></div>`;\
      });\
      if (window.marked) {\
        return window.marked.parse(html);\
      }\
      return "<p>Error loading Markdown parser.</p>";\
    }\
' index.html

// src/lib/print.ts
export function printElementAsPDF(el: HTMLElement | null, title = "Response Details") {
  if (!el) return;

  const contentHTML = el.outerHTML || el.innerHTML || "";
  const styles = `
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial;
         background:#fff;color:#111;padding:24px;margin:0;}
    .card{border:1px solid #e5e7eb;border-radius:8px;padding:12px;}
    h1,h2,h3{margin:0 0 10px 0}
    pre{white-space:pre-wrap;word-break:break-word}
    code{white-space:pre-wrap}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #e5e7eb;padding:6px;text-align:left}
    .muted{color:#555}
    @media print { .no-print { display:none !important; } }
  `;
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${contentHTML}
        <script>
          window.addEventListener('load', function() {
            setTimeout(function(){
              try { window.print(); } catch(e){}
              setTimeout(function(){ window.close(); }, 300);
            }, 80);
          });
        <\/script>
      </body>
    </html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank", "noopener,noreferrer,width=1024,height=768");
  if (!w) alert("Please allow pop-ups to download the PDF.");
}

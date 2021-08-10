export function setFrameFontCss(fontCss: string) {
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.appendChild(document.createTextNode(fontCss));
  document.head.appendChild(style);
}

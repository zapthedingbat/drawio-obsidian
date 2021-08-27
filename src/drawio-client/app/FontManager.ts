export class FontManager {
  private cache: Map<string, Promise<string>>;
  constructor(cache?: Map<string, Promise<string>>) {
    this.cache = cache || new Map<string, Promise<string>>();
  }

  public async getGoogleFontCssByName(fontName: string) {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(
      / /g,
      "+"
    )}`;
    return await this.getFontCssForUrl(fontName, fontUrl);
  }

  public async getFontCssForUrl(
    fontFamily: string,
    url: string
  ): Promise<string> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    const css = this.getFontCssForUrlUncached(fontFamily, url);
    this.cache.set(url, css);
    return css;
  }

  private async getFontCssForUrlUncached(fontFamily: string, url: string) {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    if (/text\/css/.test(contentType)) {
      const css = await response.text();
      const patternFontFace = /@font-face\s*\{([^\}]+)\}/g;
      const patternDeclaration = /(?:\s*([a-z0-9-]+)\s*\:\s*([^;]+)\;)/g;
      const patternUrl = /url\(['"]?([^\)]+)['"]?\)/;
      const rules = [];
      let fontFaceMatch;
      while ((fontFaceMatch = patternFontFace.exec(css)) !== null) {
        const rule = [];
        const fontFaceCss = fontFaceMatch[1];
        let declarationMatch;
        while (
          (declarationMatch = patternDeclaration.exec(fontFaceCss)) !== null
        ) {
          let declaration = declarationMatch[0];
          const property = declarationMatch[1];
          const value = declarationMatch[2];
          if (property === "src") {
            const urlMatch = patternUrl.exec(value);
            if (urlMatch) {
              const url = urlMatch[1];
              const fontResponse = await fetch(url);
              const blob = await fontResponse.blob();
              const dataUrl = await this.toDataUrl(blob);
              declaration = declaration.replace(url, dataUrl);
            }
          }
          rule.push(declaration);
        }
        rules.push(rule);
      }
      return rules.map((rule) => `@font-face {${rule.join("")}}`).join("");
    } else {
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      return `@font-face {
        font-family: '${fontFamily}';
        src: url('${dataUrl}')
      }`;
    }
  }

  private toDataUrl(blob: Blob) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}

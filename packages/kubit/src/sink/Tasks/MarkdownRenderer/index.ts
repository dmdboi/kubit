import { outputFile, readFile } from 'fs-extra';
import open from 'open';
import { tmpdir } from 'os';
import { join } from 'path';

import { css } from './Styles';
import { copyIcon } from './Icon';

/**
 * Markdown renderer for opening the instructions md file inside the
 * terminal or the browser.
 */
export class MarkdownRenderer {
  constructor(
    private mdFileAbsPath: string,
    private packageName: string
  ) {}

  /**
   * Generates HTML with the markdown processed code
   */
  public generateHtml(contents: string) {
    console.log(`Rendering markdown in browser...`);
    console.log(contents);

    return `<html>
      <head>
        <style type="text/css">${css}</style>
      </head>
      <body>
        <article class="markdown-body">
          <h1> Setup instructions for
            <a href="https://npmjs.org/package/${this.packageName}" target="_blank">${this.packageName}</a>
          </h1>
          ${contents}
        </article>

        <script>
        document.addEventListener('DOMContentLoaded', () => {
          const preBlocks = document.querySelectorAll('pre');
  
          preBlocks.forEach((preBlock) => {
            // Create a container to hold the pre block and the button
            const container = document.createElement('div');
            container.className = 'pre-container';
  
            // Create the copy button
            const copyButton = document.createElement('button');
            copyButton.innerHTML = ${copyIcon};
            copyButton.className = 'copy-button';
  
            // Add event listener to copy the content of the pre block
            copyButton.addEventListener('click', () => {
              const tempElement = document.createElement('textarea');
              tempElement.value = preBlock.innerText;
              document.body.appendChild(tempElement);
              tempElement.select();
              document.execCommand('copy');
              document.body.removeChild(tempElement);
              alert('Content copied to clipboard');
            });
  
            // Insert the pre block and the button into the container
            preBlock.parentNode.insertBefore(container, preBlock);
            container.appendChild(preBlock);
            container.appendChild(copyButton);
          });
        });
      </script>
      </body>
    </html>`;
  }

  /**
   * Opens the html contents by writing it to a temporary
   * file and opens up the file inside the browser.
   */
  private async openContentsInBrowser(html: string) {
    const filePath = join(tmpdir(), `kubit-${new Date().getTime()}.html`);
    await outputFile(filePath, html);
    await open(filePath, { wait: false });
  }

  /**
   * Converts markdown to HTML and opens it up inside the browser
   */
  public async renderInBrowser() {
    const { marked, Renderer } = await import('marked');
    const renderer = new Renderer();

    try {
      const contents = await readFile(this.mdFileAbsPath, 'utf-8');
      const html = this.generateHtml(marked.setOptions({ renderer })(contents.trim()));
      await this.openContentsInBrowser(html);
    } catch (error) {}
  }

  /**
   * Writes markdown in the terminal
   */
  public async renderInTerminal() {
    const { marked } = await import('marked');
    const { default: TerminalRenderer } = await import('marked-terminal');
    const renderer = new TerminalRenderer();

    try {
      const contents = await readFile(this.mdFileAbsPath, 'utf-8');
      console.log(marked.setOptions({ renderer })(contents.trim()).trim());
    } catch (error) {}
  }
}

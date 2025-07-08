// class CodeBlock extends Component 
// {
//   #codeElement;
  
//   constructor({ code = '', language = 'plaintext', options = {} } = {}) 
//   {
//     super({ tagName: 'pre', options: options });

//     this.#codeElement = document.createElement('code');
//     this.#codeElement.style.marginLeft = '16px';
//     this.#codeElement.style.marginRight = '16px';
//     this.#codeElement.style.borderRadius = '10px';
//     this.#codeElement.className = `language-${language}`;
//     this.code = code;
  
//     this.element.appendChild(this.#codeElement);
//     this.#enableCopyOnClick();
//   }
  
//   get code() { return this.#codeElement.textContent; }
  
//   set code(code)
//   {
//     this.#codeElement.textContent = code;
//     this.#highlight();
//   }

//   #highlight() { if(window.hljs) window.hljs.highlightElement(this.#codeElement); }
  
//   #enableCopyOnClick() 
//   {
//     this.addEventListener({ event: 'click', handler: () => this.#copyToClipboard()});
//     this.addClassName({ className: 'copyable' });
//   }

//   #copyToClipboard() 
//   {
//     navigator.clipboard.writeText(this.code).then(() => 
//     {
//       this.addClassName({ className: 'copied' });
//       setTimeout(() => this.removeClassName({ className: 'copied' }), 1000);
//     }).catch(err => console.error('Copy failed:', err));
//   }
// }
// 

/////////////////////////////////////////////////

// class Table extends Component 
// {
//   #grid;
  
//   constructor(options = {}) 
//   {
//     super({ tagName: 'div', options: options });
    
//     if(options.columns && options.data)
//     {
//       this.#grid = new gridjs.Grid({
//         columns: options.columns,
//         data: options.data,
//         autoWidth: false
//       });
//     }
  
//     this.#grid.render(this.element);
//   }

//   updateData(newData) {
//     this.#grid.updateConfig({ data: newData }).forceRender();
//   }

//   updateColumns(newColumns) {
//     this.#grid.updateConfig({ columns: newColumns }).forceRender();
//   }
// }
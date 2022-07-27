const buttonElement = document.querySelector('#getColorBtn');
const inputElement = document.querySelector('#colorInput');
const resultElement = document.querySelector('#result');
const copyBtnElement = document.querySelector('#copyBtn');
const errorElement = document.querySelector('#error');
const colorBlockElement = document.querySelector('#color-block');
inputElement.focus();
inputElement.addEventListener('keydown', (e)=>{
  if(e.code === 'Enter') main();
  if(errorElement.textContent) errorElement.textContent = '';
});
inputElement.addEventListener('change', (e)=>{
  handleChangePreviewColor(e.target.value);
})
buttonElement.addEventListener('click', ()=>{
  main()
});
resultElement.addEventListener('keyup', (e)=>{
  if(e.code === 'Enter') {
    handleCopyClipBoard(true)
  }
})
copyBtnElement.addEventListener('click', ()=>{handleCopyClipBoard(true)});
  
async function main(){
  try{
    const color = new Color(inputElement.value);
    handleCopyClipBoard(false);
    const hexColor = color.hex;
    if(hexColor) {
      handleLoad(true);
      const response = await fetchData(hexColor)
      handleLoad(false);
      const {colorName, rgbList} = getColorInfo(response);
      const result = Color.getColorDefine(colorName, rgbList, `#${hexColor}`)
      resultElement.value = result;   
      resultElement.focus();
    }
  }catch(err){
    handleError(err);
  }
  }
  async function fetchData(hexColor){
  const url = `https://color-parse.herokuapp.com/https://hexcol.com/color/${hexColor}`
  const response = await fetch(url).then(data=>data.text())
  return response;
  }
  function prefixInput(inputValue){
  // TODO prefix rgb
  let preFix = inputValue.replace(/[\s\n\#]+/g, '');
  return preFix;
  }
  function getColorInfo(htmlStr){
  if(htmlStr.length < 30000){
    throw 'Not Found';
  }
  // Remove strong element
  htmlStr = htmlStr.replace(/<strong[^<]+<\/strong>\s*/g, '');
  const colorName = htmlStr.match(/(?<=[^\>]+text-muted[^\>]+>)[^</^\n]+(?=<\/)/g)[0];
  const rgbList = [...htmlStr.match(/(?<=([^>]+minBox[^>]+>))\d+(?=<\/)/g)];
  return {colorName, rgbList};
  }
  function getResult(colorName, rgbList, colorHex){
  // TODO: refix colorName ['Medium Violet-Red', 'Red', 'Pictor Blue', 'Green (Crayola)', 'Dark Slate Blue']
  colorName = colorName
    .replace(/\s\(\w+\)/g, '')
    .replace(/\s/, '-').toLowerCase();
  return `$${colorName}: rgb(${rgbList.join(', ')}); \/\/ ${colorHex}`;
  }
  function handleError(error){
    errorElement.textContent = typeof error === 'string' ? error : '!ERROR'
  }
  function handleLoad(isLoad){
  const loadElement = document.querySelector('#load')
  if(isLoad){
    loadElement.classList.remove('hide');
  }
  else {
    loadElement.classList.add('hide');
  }
  }
  function handleCopyClipBoard(isCopy){
    copyBtnElement.textContent = isCopy ? 'Copied': 'Copy';
  if(isCopy){
    navigator.clipboard.writeText(resultElement.value);
  }
  }
  
  function handleChangePreviewColor(colorStr){
  if(colorStr.match(/rgb|#/g) === null) colorStr = `#${colorStr.replace(/[\n\s]+/g, '')}`;
  if(Color.isColor(colorStr)){
    colorBlockElement.style.backgroundColor = colorStr;
  }
  else{
    colorBlockElement.style.backgroundColor = 'transparent';
  }
  }
  
  class Color {
  hex;
  constructor(inputColor){
    let preFix = inputColor.replace(/[\s\n\#]+/g, '');
    const isRgb = preFix.includes('rgb');
    if(isRgb) {
      const rgbList = preFix.replace(/[^\d^,]/g, '').split(',');
      preFix = this.#rgbToHex(rgbList);
    }
    this.hex = preFix;
  }
  #componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  #rgbToHex(rgb){
    return `${
      this.#componentToHex(Number(rgb[0]))}${
      this.#componentToHex(Number(rgb[1]))}${
      this.#componentToHex(Number(rgb[2]))}`;
  }
  static getColorDefine(colorName, rgbList, colorHex){
    colorName = colorName
    .replace(/(\s\(\w+\))|\'/g, '')
    .replace(/\s/g, '-').toLowerCase();
    return `$${colorName}: rgb(${rgbList.join(', ')}); \/\/ ${colorHex}`; 
  }
  static isColor(colorStr){
    return CSS.supports('color', colorStr);
  }
  }
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
    .replace(/\'/g, '')
    .replace(/\s/g, '-').toLowerCase();
    return `$${colorName}: rgb(${rgbList.join(', ')}); \/\/ ${colorHex}`; 
  }
  static isColor(colorStr){
    return CSS.supports('color', colorStr);
  }
}

class LocalStorage {
  static name = 'EXTENSION_GET_COLOR_INFO_DEFINE';

  static storeData(data) {
    localStorage.setItem(this.name, JSON.stringify(data))
  };

  static getData(){
    const localStorageData = localStorage.getItem(this.name);
    if(!localStorageData) return null;
    return JSON.parse(localStorageData);
  };

  static clear(){
    localStorage.removeItem(this.name);
  }
}

class GetColorInfoProgram {
  #runBtnEle;
  #colorInputEle;
  #resultInputEle;
  #copyBtnEle;
  #errorEle;
  #successEle;
  #colorBlockEle;
  #loadEle;

  #isCopied = false;

  #color;

  constructor({
    runBtnSel,
    colorInputSel,
    resultInputSel,
    copyBtnSel,
    errorSel,
    successSel,
    colorBlockSel,
    loadSel,
  }){
    this.#runBtnEle = document.querySelector(runBtnSel);
    this.#colorInputEle = document.querySelector(colorInputSel);
    this.#resultInputEle = document.querySelector(resultInputSel);
    this.#copyBtnEle = document.querySelector(copyBtnSel);
    this.#errorEle = document.querySelector(errorSel);
    this.#successEle = document.querySelector(successSel);
    this.#colorBlockEle = document.querySelector(colorBlockSel);
    this.#loadEle = document.querySelector(loadSel);
  }

  #init(){
    try{
      window.addEventListener('load', ()=>{ this.#handleWindowLoad(); });
      window.addEventListener('blur',()=> { this.#handleWindowBlur(); });
      this.#runBtnEle.addEventListener('click', () => { this.#handleSearchBtnClick(); });
      this.#copyBtnEle.addEventListener('click', () => { this.#handleCopyClick(true); });
      this.#colorInputEle.addEventListener('change', (e)=> { this.#handleInputChange(e.target.value)});
      this.#colorInputEle.addEventListener('keyup', (e)=> { this.#handleInputPress(e.key)});
      this.#resultInputEle.addEventListener('keypress', (e)=> { this.#handleResultInputPress(e.key)});
    }
    catch(err){
       throw err;
    }

  }

  run(){
    try {
      this.#init();

    }
    catch(err){
      this.#handleError(err);
    }
  }

  /** EVENT FUNCTIONS */
  #handleWindowLoad(){
    const localStorageData = LocalStorage.getData();
    
    if(localStorageData){
      this.#colorInputEle.value = localStorageData.input;
      this.#resultInputEle.value = localStorageData.output;
    }
    this.#colorInputEle.select();
  }

  #handleWindowBlur(){
    if(!this.#isCopied){
      LocalStorage.storeData({
        input: this.#colorInputEle.value || "",
        output: this.#resultInputEle.value || "",
      });
      return;
    }

    LocalStorage.clear();
  }

  async #handleSearchBtnClick(){
    try{
      this.#handleError(undefined);
      this.#handleSuccess(undefined);
      this.#handleCopyClick(false);
      this.#writeDataToResultInput("");

      const colorInput = this.#colorInputEle.value;
      this.#color = new Color(colorInput);

      this.#handleLoading(true);
      
      const data = await this.#fetchData(this.#color.hex);

      
      const {colorName, rgbList} = this.#getColorInfo(data);
      
      this.#writeDataToResultInput(Color.getColorDefine(colorName, rgbList, this.#color.hex));
      
      this.#handleLoading(false);
      this.#handleSuccess(colorName);

    }catch(err){
      this.#handleError(err);
    }
  }

  async #handleCopyClick(isCopy) {
    if(isCopy){
      this.#isCopied = true;
      this.#copyBtnEle.textContent = 'Copied';
      navigator.clipboard.writeText(this.#resultInputEle.value);
      return;
    }

    this.#isCopied = false;
    this.#copyBtnEle.textContent = 'Copy';
    
  }

  #handleInputChange(inputData){
    if(inputData.match(/rgb|#/g) === null) inputData = `#${inputData.replace(/[\n\s]+/g, '')}`;
    if(Color.isColor(inputData)){
      this.#colorBlockEle.style.backgroundColor = inputData;
    }
    else{
      this.#colorBlockEle.style.backgroundColor = 'transparent';
    }
  }

  #handleInputPress(key){
    if(key === 'Enter') this.#runBtnEle.click();
    if(this.#resultInputEle.value !== "") { 
      this.#handleResetStatus();
    };
  }

  #handleResultInputPress(key){
    if(key === 'Enter') {
      this.#copyBtnEle.click();
    }
  }
  
  /** UPDATE STATUS FUNCTIONS */
  #handleError(error){
    if(error === undefined){
      this.#errorEle.textContent = '';
      return;
    }
    // TODO remove this line when finish
    this.#handleLoading(false);
    this.#colorInputEle.select();
    this.#writeDataToResultInput("");
    this.#errorEle.textContent = typeof error === 'string' ? error : 'lỗi không xác định !' 
  }
  
  #handleSuccess(colorName){
    if(colorName === undefined) {
      this.#successEle.textContent = "";
      return;
    }
    const reg = /\([^\)]+\)/g;

    this.#successEle.textContent = colorName.match(reg) === null ? "OK": "Check lại tên biến!";
  }

  #handleLoading(isLoading){
    if(isLoading){
      this.#loadEle.classList.remove('hide');
      return;
    }
    
    this.#loadEle.classList.add('hide');
  }

  #handleResetStatus(){
    this.#handleError(undefined);
    this.#handleSuccess(undefined);
    this.#handleCopyClick(false);
    this.#writeDataToResultInput("");
  }
  
  /** ASSES FUNCTIONS */
  async #fetchData(hexColor){
    const url = `https://color-parse.herokuapp.com/https://hexcol.com/color/${hexColor}`
    const response = await fetch(url).then(data=>data.text())
    return response;
  }

  #getColorInfo(htmlStr){
    if(htmlStr.length < 30000){
      throw 'Not Found';
    }
    // Remove strong element
    htmlStr = htmlStr.replace(/<strong[^<]+<\/strong>\s*/g, '');
    const colorName = htmlStr.match(/(?<=[^\>]+text-muted[^\>]+>)[^</^\n]+(?=<\/)/g)[0];
    const rgbList = [...htmlStr.match(/(?<=([^>]+minBox[^>]+>))\d+(?=<\/)/g)];
    return {colorName, rgbList};
  }

  #writeDataToResultInput(colorDefine){
    this.#resultInputEle.value = colorDefine;
    if(colorDefine !== ""){
      this.#resultInputEle.select();
    }
  }

}

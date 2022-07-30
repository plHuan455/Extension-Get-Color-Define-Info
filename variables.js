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

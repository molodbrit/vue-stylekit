import Vue from "vue";

const setActiveTabName = (tabsName:string, tabAnchore:string = '', dontResize:boolean = false) => {
  if(!tabsStore.tabsNames){
    tabsStore.tabsNames = []
  }
  if(tabsStore.tabsNames[tabsName]) {
    const parentId = tabsStore.tabsNames[tabsName];
    const parentArray = tabsStore.tabsParents[parentId];
    for (let key in parentArray) {
      if (typeof parentArray[key] === 'object') {
        parentArray[key].isActive = false;
      }
    }
    parentArray[tabsName].isActive = true;
  }
  // Определение Internet Explorer. нужно т.к. в нем не работет resize
  const browserName = navigator.userAgent.toLowerCase(),
    isIE = (/trident/gi).test(browserName) || (/msie/gi).test(browserName);
  if (!dontResize) {
    if (!isIE) {
      window.dispatchEvent(new Event("resize"));
    } else {
      let resizeEvent = window.document.createEvent('UIEvents'); 
      resizeEvent.initUIEvent('resize', true, false, window, 0); 
      window.dispatchEvent(resizeEvent);
    }
  }
  if (tabAnchore && tabAnchore.length > 0) {
    window.history.replaceState(undefined, undefined, "#" + tabAnchore);
  }
  runWatchers();
};
const runWatchers = ()=>{
  for (let fnIndex in tabsStore.watcherFunction) {
    tabsStore.watcherFunction[fnIndex]();
  }
}
const addTabUuid = (tabsContainerId: number, tabsName: string) => {

  if (!tabsStore.tabsParents[tabsContainerId]) {
    tabsStore.tabsParents[tabsContainerId] = {};
    if(tabsStore.tabsParents[tabsContainerId][tabsName]){
      console.error('tabs name must be unique')
    }else {
      tabsStore.tabsParents[tabsContainerId][tabsName] = { isActive: true };
    }
  } else {
    tabsStore.tabsParents[tabsContainerId][tabsName] = { isActive: false };
  }
  tabsStore.tabsNames[tabsName] = tabsContainerId;
  runWatchers();
};
const addWatcher = (fn) => {
  tabsStore.watcherFunction.push(fn);
};
const setTabWidth = (parentUiid:number, width:number)=>{
  if(!tabsStore.tabsParents[parentUiid].width) {
    tabsStore.tabsParents[parentUiid].width = width;
    tabsStore.tabsParents[parentUiid].lastUpdateTime = (new Date()).getTime();
  }
  else{
    if(tabsStore.tabsParents[parentUiid].width < width){
      tabsStore.tabsParents[parentUiid].width = width;
      tabsStore.tabsParents[parentUiid].lastUpdateTime = (new Date()).getTime();
      tabsStore.tabsParents[parentUiid].centerText = true;
    }
  }
  setTimeout(()=>{
    checkMaxWidth(parentUiid);
  },400)
  // runWatchers();
}
const checkMaxWidth = (parentUiid)=>{
  const time =(new Date()).getTime();
  if(time - tabsStore.tabsParents[parentUiid].lastUpdateTime >= 400 ){
    tabsStore.tabsParents[parentUiid].lastUpdateTime = (new Date()).getTime();
    runWatchers();
  }
}
export const tabsStore = Vue.observable({
  setActiveTabName: setActiveTabName,
  addTabUuid: addTabUuid,
  tabsParents: {},
  tabsNames: {},
  addWatcher: addWatcher,
  watcherFunction: [],
  setTabWidth: setTabWidth

});

const {app, BrowserWindow, Menu} = require('electron')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow(
    { 
      width: 946, 
      height: 573,
      resizable: false,
      autoHideMenuBar: true
    }
  )
  mainWindow.loadFile('index.html')

  const mainMenu = Menu.buildFromTemplate([{
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q': 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }]);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
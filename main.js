const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

// SET ENV
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on("ready", function() {
  //Create new windows
  mainWindow = new BrowserWindow({});
  //Load HTML into windows
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Quit app when closed (Otherwise add window will stay open)
  mainWindow.on("closed", () => {
    app.quit();
  });

  /*
  // Garbage collection handle
  addWindow.on("closed", function() {
    addWindow = null;
  });
*/

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
  //Create new windows
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add To-Do List Item"
  });
  //Load HTML into windows
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );
}

//Catch item:add
ipcMain.on("item:add", function(e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        }
      },
      {
        label: "Clear Items",
        click() {
          mainWindow.webContents.send("item:clear");
        }
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  }
];

//If Mac, add empty object to menu (In order to show file submenu)
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

//Add developer tools item if not in production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: "reload"
      }
    ]
  });
}

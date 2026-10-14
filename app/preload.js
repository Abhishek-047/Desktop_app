// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("athena", {
    registerListenerForTimerTickFromMain: (callback) => {
        // callback is setTimer
        const fn = (event, message) => {
            callback(message);
        }

        ipcRenderer.on('timer', fn);

        return () => {
            ipcRenderer.removeListener('timer', fn);
        }
    },
    startTimerOnMain: () => {
        try {
            return ipcRenderer.invoke('start-timer');
        } catch (error) {
            throw "error";
        }
    },

    // Functions related to capturing camera snaps of user
    registerListenerForCameraSnapFromMain: (callback) => {
        ipcRenderer.on('camera-shot', callback);

        return () => {
            ipcRenderer.removeListener('camera-shot', callback);
        }
    },

    storeCameraSnapImageOnDisk: (data) => {
        ipcRenderer.invoke('store-camera-snap-image-on-disk', data);
    },

    // TASK: Converted to use invoke to send back clicked button indices and check statuses
    showRules: () => {
        return ipcRenderer.invoke("show-rules");
    },

    // TASK: Added binders for folder and file selection routes
    selectStorageFolder: () => {
        return ipcRenderer.invoke("select-storage-folder");
    },
    selectFile: () => {
        return ipcRenderer.invoke("select-file");
    },
    exitApp: () => {
        return ipcRenderer.invoke("exit-app");
    }
})

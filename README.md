<div align="center">
<br>
<img width="500" src="/src/renderer/assets/meteorman_logo.png" alt="meteorman">
<br>
<br>
</div>

<p align="center" color="#6a737d">
A DDP Client with GUI
</p>

<div align="center">

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com) 
[![forthebadge](http://forthebadge.com/images/badges/uses-js.svg)](http://forthebadge.com) 
[![forthebadge](https://forthebadge.com/images/badges/made-with-vue.svg)](http://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/makes-people-smile.svg)](http://forthebadge.com)

</div>

## Starting 🚀

Meteorman is The Postman of Meteor. It is a DDP Client with GUI

### Preview 🎥

![](example.png)

### Supported Platforms 💻

- macOS 🍎 ✅
- Linux 🐧 ✅
- Windows ✅

### Downloads 💾 

| Platform | Arch    | Version | Link                                                                                                              |
| ---------- | --------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Windows    | x64             | 2.0.1   | [Download](https://github.com/antwaremx/meteorman/releases/download/2.0.1/Meteorman-2.0.1.exe)   |
| Mac        | x64             | 2.0.1   | [Download](https://github.com/antwaremx/meteorman/releases/download/2.0.1/Meteorman-2.0.1.dmg)         |
| Linux      | x64             | 2.0.1   | [Download](https://github.com/antwaremx/meteorman/releases/download/2.0.1/Meteorman-2.0.1.deb)    |


## For Developers 🚀

### System Requirements 📋

- A current Node.js LTS release
- npm

### Installation 🔧

[git](https://git-scm.com/) is required to run the following console commands:
```sh
$ git clone https://github.com/antwaremx/meteorman
```

### Build Setup 📦

```sh
# install dependencies
$ npm install

# start Electron Forge with Vite hot reload
$ npm start

# type-check the Electron and Vue application
$ npm run typecheck

# package the application for the current platform
$ npm run build

# create an installer/archive for the current platform
$ npm run make

# target a configured Electron Forge maker explicitly
$ npm run make:mac
$ npm run make:windows
$ npm run make:linux
```

Forge writes distributable output to `out/make`. Native tooling and maker
requirements still apply: use the matching operating system or a configured CI
runner for production artifacts. In particular, the Windows and Linux commands
are exposed for consistent workflows but are not guaranteed to cross-build
complete release artifacts from macOS.

### Application stack

- Electron and Electron Forge
- Vue 3 with TypeScript
- Vite
- Vuetify
- Pinia
- Monaco Editor

The renderer runs without Node.js integration. Native collection import/export is
exposed through a small context-isolated preload API.

---

<div align="center">
<br>
<img width="250" src="/src/renderer/assets/Powered%20light%202.png" alt="powered">
<br>
<br>
</div>

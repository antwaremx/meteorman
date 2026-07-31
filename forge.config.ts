import type { ForgeConfig } from '@electron-forge/shared-types';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: ['static'],
    name: 'Meteorman',
    executableName: 'meteorman',
    appBundleId: 'com.antware.meteorman',
    icon: 'build/icons/icon'
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: 'Meteorman',
        authors: 'Antware',
        description: 'A DDP client with GUI',
        iconUrl: 'https://raw.githubusercontent.com/antwaremx/meteorman/master/build/icons/icon.ico',
        setupIcon: 'build/icons/icon.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {}
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          name: 'meteorman',
          productName: 'Meteorman',
          categories: ['Development', 'Utility'],
          icon: 'build/icons/256x256.png'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {
        options: {
          name: 'meteorman',
          productName: 'Meteorman',
          categories: ['Development', 'Utility'],
          icon: 'build/icons/256x256.png'
        }
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main/main.ts',
            config: 'vite.main.config.ts'
          },
          {
            entry: 'src/main/preload.ts',
            config: 'vite.preload.config.ts'
          }
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.ts'
          }
        ]
      }
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
};

export default config;

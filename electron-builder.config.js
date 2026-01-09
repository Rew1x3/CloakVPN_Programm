export default {
  appId: 'com.cloakvpn.app',
  productName: 'CloakVPN',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
    '!electron/**/*.ts',
    '!electron/**/*.map',
  ],
  win: {
    target: [
      {
        target: 'portable',
        arch: ['x64'],
      },
    ],
    artifactName: '${productName}-${version}-${arch}.${ext}',
    icon: 'build/icon.ico',
  },
  portable: {
    artifactName: '${productName}-${version}-portable.${ext}',
  },
  mac: {
    target: 'dmg',
    icon: 'build/icon.icns',
  },
  linux: {
    target: 'AppImage',
    icon: 'build/icon.png',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
}



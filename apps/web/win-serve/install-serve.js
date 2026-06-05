import nodeWindows from 'node-windows'
const Service = nodeWindows.Service;

// 創建服務對象
const svc = new Service({
  name: 'Angke On Prem Nuxt Server', 
  description: '昂科資訊落第部屬解決方案應用程式伺服器 (Nuxt)', 
  script: process.cwd() + '\\dist\\app.js',
  workingDirectory: process.cwd(),
  logpath: process.cwd() + '\\win-serve\\logs', 
  wait: 2, // 如果服務崩潰，嘗試等待重新啟動時間（秒）
  grow: 0.5, // 每次重新啟動等待重新啟動時間（秒）
  env: process.cwd() + '\\.env'
  //allowServiceLogon: true (使用這個參數，會導致服務無法啟動)
});
// (指定帳號，會導致服務無法啟動)
// svc.logOnAs.account = 'NT AUTHORITY\\NetworkService';
// svc.logOnAs.password = '';


// 監聽是否成功服務
svc.on('install', () => {
  console.log('Service installed successfully!');
  svc.start();
});

svc.on('start', () => {
  console.log('Service started successfully!');
});

svc.on('error', (err) => {
  console.error('Error occurred while starting or running the service:', err);
});

// 啟動服务
svc.install();

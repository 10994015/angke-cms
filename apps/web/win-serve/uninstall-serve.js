import nodeWindows from 'node-windows'
const Service = nodeWindows.Service;

// 創建服務對象
const svc = new Service({
  name: 'Angke On Prem Nuxt Server', 
  description: '昂科資訊落第部屬解決方案應用程式伺服器 (Nuxt)', 
  script: process.cwd() + '\\.output\\server\\index.mjs',
});



// 抓取卸載事件
svc.on('uninstall', () => {
  console.log('Service uninstalled successfully!');
  console.log('The service exists: ', svc.exists);
});

svc.uninstall();
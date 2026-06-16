export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '薄弱诊断',
      navigationBarBackgroundColor: '#2563eb',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '薄弱诊断',
      navigationBarBackgroundColor: '#2563eb',
      navigationBarTextStyle: 'white',
    }
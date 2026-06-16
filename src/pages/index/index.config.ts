export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '智能辅导',
      navigationBarBackgroundColor: '#2563eb',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '智能辅导',
      navigationBarBackgroundColor: '#2563eb',
      navigationBarTextStyle: 'white',
    }
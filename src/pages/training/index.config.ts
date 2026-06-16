export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '专项训练',
      navigationBarBackgroundColor: '#2563eb',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '专项训练',
      navigationBarBackgroundColor: '#2563eb',
      navigationBarTextStyle: 'white',
    }
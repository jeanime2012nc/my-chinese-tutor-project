export default typeof defineAppConfig === 'function'
  ? defineAppConfig({
      pages: [
        'pages/index/index',
        'pages/diagnosis/index',
        'pages/training/index',
      ],
      window: {
        navigationBarTitleText: '语文智能批改',
        navigationBarBackgroundColor: '#2563eb',
        navigationBarTextStyle: 'white',
      },
      tabBar: {
        color: '#6b7280',
        selectedColor: '#2563eb',
        backgroundColor: '#ffffff',
        borderStyle: 'black',
        list: [
          {
            pagePath: 'pages/index/index',
            text: '智能批改',
            iconPath: './assets/tabbar/book-open.png',
            selectedIconPath: './assets/tabbar/book-open-active.png',
          },
          {
            pagePath: 'pages/diagnosis/index',
            text: '薄弱诊断',
            iconPath: './assets/tabbar/check-square.png',
            selectedIconPath: './assets/tabbar/check-square-active.png',
          },
          {
            pagePath: 'pages/training/index',
            text: '专项训练',
            iconPath: './assets/tabbar/dumbbell.png',
            selectedIconPath: './assets/tabbar/dumbbell-active.png',
          },
        ],
      },
    })
  : {
      pages: [
        'pages/index/index',
        'pages/diagnosis/index',
        'pages/training/index',
      ],
      window: {
        navigationBarTitleText: '语文智能批改',
        navigationBarBackgroundColor: '#2563eb',
        navigationBarTextStyle: 'white',
      },
      tabBar: {
        color: '#6b7280',
        selectedColor: '#2563eb',
        backgroundColor: '#ffffff',
        borderStyle: 'black',
        list: [
          {
            pagePath: 'pages/index/index',
            text: '智能批改',
            iconPath: './assets/tabbar/book-open.png',
            selectedIconPath: './assets/tabbar/book-open-active.png',
          },
          {
            pagePath: 'pages/diagnosis/index',
            text: '薄弱诊断',
            iconPath: './assets/tabbar/check-square.png',
            selectedIconPath: './assets/tabbar/check-square-active.png',
          },
          {
            pagePath: 'pages/training/index',
            text: '专项训练',
            iconPath: './assets/tabbar/dumbbell.png',
            selectedIconPath: './assets/tabbar/dumbbell-active.png',
          },
        ],
      },
    }
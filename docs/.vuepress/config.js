module.exports = {
  title: 'Laravel Package Development',
  description: 'A central place to learn how to create packages from scratch.',
  head: [
    ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/assets/favicons/apple-touch-icon.png"}],
    ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/assets/favicons/favicon-32x32.png"}],
    ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/assets/favicons/favicon-16x16.png"}],
    ['link', { rel: "manifest", href: "/assets/favicons/site.webmanifest"}],
    ['link', { rel: "mask-icon", href: "/assets/favicons/safari-pinned-tab.svg", color: "#3a0839"}],
    ['link', { rel: "shortcut icon", href: "/assets/favicons/favicon.ico"}],
    ['meta', { name: "msapplication-TileColor", content: "#3a0839"}],
    ['meta', { name: "msapplication-config", content: "/assets/favicons/browserconfig.xml"}],
    ['meta', { name: "theme-color", content: "#ffffff"}],
  ],
  themeConfig: {
    logo: '/laravel-package-logo.png',
    nav: [
      {
        text: 'John Braun',
        link: 'https://johnbraun.blog/'
      },
      {
        text: 'GitHub',
        link: 'https://github.com/Jhnbrn90/LaravelPackage.com'
      }
    ],
    sidebar: [
      '/',
      '/01-The-Basics',
      '/02-Development-Environment',
      '/03-Service-Providers',
      '/04-Testing',
      '/05-Facades',
      '/06-Artisan-Commands',
      '/07-Configuration-Files',
      '/08-Models-and-Migrations',
      '/09-Routing',
      '/10-Events-and-Listeners',
      '/11-Middleware',
      '/12-Mail',
      '/13-Jobs',
      '/14-Notifications',
    ]
  },
  plugins: [
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-156652082-1'
      }
    ]
  ]
}
module.exports = {
  title: 'Laravel Package Development',
  description: 'Learn to create Laravel specific PHP packages from scratch, following this open documentation. Contributions are welcomed.',
  head: [
    ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/assets/favicons/apple-touch-icon.png"}],
    ['link', { rel: "icon", href: "/assets/laravel-package-logo.png"}],
    ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/assets/favicons/favicon-32x32.png"}],
    ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/assets/favicons/favicon-16x16.png"}],
    ['link', { rel: "manifest", href: "/manifest.webmanifest"}],
    ['link', { rel: "mask-icon", href: "/assets/favicons/safari-pinned-tab.svg", color: "#3a0839"}],
    ['link', { rel: "shortcut icon", href: "/assets/favicons/favicon.ico"}],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { name: "msapplication-TileColor", content: "#3a0839"}],
    ['meta', { name: "msapplication-config", content: "/assets/favicons/browserconfig.xml"}],
    ['meta', { name: "theme-color", content: "#ffffff"}],
    ['meta', { name: "viewport", content: "width=device-width"}],
  ],
  themeConfig: {
    logo: '/laravel-package-logo.png',
    repo: 'Jhnbrn90/LaravelPackage.com',
    docsBranch: 'master',
    author: {
        'name': 'John Braun',
        'twitter': '@jhnbrn90'
    },
    docsDir: 'docs',
    editLinks: true,
    editLinkText: 'Improve this page (submit a PR)',
    contributors: false,
    lastUpdated: false,
    domain: 'https://www.laravelpackage.com',
    docsearch: {
      container: '#docsearch',
      appId: process.env.DOCSEARCH_APP_ID,
      apiKey: process.env.DOCSEARCH_KEY,
      indexName: 'laravelpackage'
    },
    navbar: [
      {
        text: 'Laravel 8.x',
        ariaLabel: 'Version Menu',
        children: [
          { text: 'Laravel 6.x - 7.x', link: 'https://v6-v7.laravelpackage.com', target:'_self', rel: false}
        ]
      },
      {
        text: 'John Braun',
        link: 'https://johnbraun.blog/'
      },
    ],
    // displayAllHeaders: true,
    sidebar: [
      '/',
      '/01-the-basics',
      '/02-development-environment',
      '/03-service-providers',
      '/04-testing',
      '/05-facades',
      '/06-artisan-commands',
      '/07-configuration-files',
      '/08-models-and-migrations',
      '/09-routing',
      '/10-events-and-listeners',
      '/11-middleware',
      '/12-mail',
      '/13-jobs',
      '/14-notifications',
      '/15-publishing',
    ]
  },
  plugins: [
      ['seo', {
        siteTitle: (_, $site) => $site.title,
        title: $page => $page.title,
        description: $page => $page.frontmatter.description,
        author: (_, $site) => $site.themeConfig.author,
        tags: $page => $page.frontmatter.tags,
        twitterCard: _ => 'summary_large_image',
        type: $page => 'article',
        url: (_, $site, path) => ($site.themeConfig.domain || '') + path,
        image: ($page, $site) => $page.frontmatter.image,
        publishedAt: $page => $page.frontmatter.date && new Date($page.frontmatter.date),
        modifiedAt: $page => $page.lastUpdated && new Date($page.lastUpdated),
    }],
    [
        '@vuepress/pwa',
        {
            skipWaiting: true,
        }
    ],
    [
        '@vuepress/docsearch',
        {
            container: '#docsearch',
            appId: process.env.DOCSEARCH_APP_ID,
            apiKey: process.env.DOCSEARCH_KEY,
            indexName: 'laravelpackage'
        }
    ],
  ]
}

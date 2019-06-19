module.exports = function (config) {
    function configureLocalBrowsers() {
      let isMac     = /^darwin/.test(process.platform),
          isWindows = /^win/.test(process.platform),
          isLinux   = !(isMac || isWindows);

      if (isMac) {
        return ['PhantomJS', 'Firefox', 'Chrome'];
      } else if (isLinux) {
        return ['PhantomJS', 'Firefox'];
      } else {
        return ['PhantomJS'];
      }
    }


    config.set({
        frameworks: ['browserify', 'mocha', 'sinon-chai'],
        preprocessors: {
          'test/**/*.js': [ 'browserify' ],
          'src/**/*.js': [ 'browserify' ]
        },
        coverageReporter: {
          dir: 'coverage/',
          reporters: [
              {type: 'html'},
              {type: 'text-summary'},
              {type: 'lcov'}
          ]
        },
        browserify: {
          debug: true,
          transform: [
            ['babelify', {'presets': ['@babel/preset-env'], 'plugins': ['istanbul']}],
          ]
        },
        files: [
          './test/setup/browser.js',
          'test/**/*.spec.js'
        ],

        proxies: {
          '/test/': '/base/test/',
        },

        reporters:['mocha', 'coverage'],

        browsers: configureLocalBrowsers(),

        browserNoActivityTimeout: 60000
    });
}

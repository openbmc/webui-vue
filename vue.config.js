module.exports = {
  devServer: {
    proxy: {
      "/": {
        target: process.env.BASE_URL,
        onProxyRes: proxyRes => {
          if (proxyRes.headers["set-cookie"]) {
            // Need to remove 'Secure' flag on set-cookie value so browser
            // can create cookie for local development
            const cookies = proxyRes.headers["set-cookie"].map(cookie =>
              cookie.replace(/; secure/gi, "")
            );
            proxyRes.headers["set-cookie"] = cookies;
          }
        }
      }
    }
  }
};

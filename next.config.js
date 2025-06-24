module.exports = {
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://www.digitalpaisagismo.online"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type"
          }
        ]
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/events",
        destination: "/api/events/index.js"
      }
    ];
  }
};

// Sets the server to use for a local machine used for development
const development = "mongodb://localhost/QuiteLive-Dev";
// Sets the server to use when the app is deployed to a remote hosting service
const production = process.env.MONGODB_URI || development;

if (process.env.NODE_ENV === "production") {
  module.exports = { mongoURI: production };
} else {
  module.exports = { mongoURI: development };
}

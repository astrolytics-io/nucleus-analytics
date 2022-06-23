const Nucleus = require("nucleus-analytics")

Nucleus.init("5eb6d2cf90556b799d753178", {
  //"62b04f270d5debec3e5d937b", {
  endpoint: "ws://localhost:5000",
  debug: true,
  sessionTimeout: 60, // 1 minute
})

Nucleus.page("home")

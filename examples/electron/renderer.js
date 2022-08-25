const Nucleus = require("nucleus-analytics")

Nucleus.init("62b04f270d5debec3e5d937b", {
  debug: true,
  //sessionTimeout: 10, // 1 minute
})

Nucleus.page("home")

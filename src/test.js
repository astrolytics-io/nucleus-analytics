const getData = async () => {
  const packageJson = await import("./package.json")

  console.log(packageJson.version)
}

getData()

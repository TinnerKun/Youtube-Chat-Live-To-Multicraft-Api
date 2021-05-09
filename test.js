const YouTube = require('./index.js')
const yt = new YouTube('Youtube Chanel', 'Youtube Api v3')
yt.on('ready', () => {
  console.log('ready!')
  yt.listen(1000)
})
yt.on('message', data => {
  const api = require("multicraft").begin({
    url: "",
    user: "",
    key: ""
  });
  try{
    api.sendAllConsoleCommand('tellraw @a ["",{"text":"Youtube","color":"dark_red"},{"text":" [ '+data.authorDetails.displayName+' ]","color":"aqua"},{"text":" '+data.snippet.displayMessage+'","color":"green"}]')
  } catch (error) {

  }
})
yt.on('error', error => {
  console.log(error)
})

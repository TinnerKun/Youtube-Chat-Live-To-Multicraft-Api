const request = require('request')
const {EventEmitter} = require('events')
class YouTube extends EventEmitter {
  constructor(channelId, apiKey) {
    super()
    this.id = channelId
    this.key = apiKey
    this.getLive()
  }
  getLive() {
    const url = 'https://www.googleapis.com/youtube/v3/search'+
      '?eventType=live'+
      '&part=id'+
      `&channelId=${this.id}`+
      '&type=video'+
      `&key=${this.key}`
    this.request(url, data => {
      if (!data.items[0])
        this.emit('error', 'Can not find live.')
      else {
        this.liveId = data.items[0].id.videoId
        this.getChatId()
      }
    })
  }
  getChatId() {
    if (!this.liveId) return this.emit('error', 'Live id is invalid.')
    const url = 'https://www.googleapis.com/youtube/v3/videos'+
      '?part=liveStreamingDetails'+
      `&id=${this.liveId}`+
      `&key=${this.key}`
    this.request(url, data => {
      if (!data.items.length)
        this.emit('error', 'Can not find chat.')
      else {
        this.chatId = data.items[0].liveStreamingDetails.activeLiveChatId
        this.emit('ready')
      }
    })
  }
  getChat() {
    if (!this.chatId) return this.emit('error', 'Chat id is invalid.')
    const url = 'https://www.googleapis.com/youtube/v3/liveChat/messages'+
      `?liveChatId=${this.chatId}`+
      '&part=id,snippet,authorDetails'+
      '&maxResults=2000'+
      `&key=${this.key}`
    this.request(url, data => {
      this.emit('json', data)
    })
  }
  request(url, callback) {
    request({
      url: url,
      method: 'GET',
      json: true,
    }, (error, response, data) => {
      if (error)
        this.emit('error', error)
      else if (response.statusCode !== 200)
        this.emit('error', data)
      else
        callback(data)
    })
  }
  listen(delay) {
    let lastRead = 0, time = 0
    this.interval = setInterval(() => this.getChat(), delay)
    this.on('json', data => {
      for (const item of data.items) {
        time = new Date(item.snippet.publishedAt).getTime()
        if (lastRead < time) {
          lastRead = time

          this.emit('message', item)
        }
      }
    })
  }
  stop() {
    clearInterval(this.interval)
  }
}

module.exports = YouTube

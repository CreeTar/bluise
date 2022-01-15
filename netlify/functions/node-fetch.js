const fetch = require('node-fetch')

const handler = async function () {
  try {
    console.log("fetch tickers")
    const response = await fetch('https://api.crypto.com/v2/public/get-ticker', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      console.log("response not OK: " + response.statusText)
      return { statusCode: response.status, body: response.statusText }
    }
    
    console.log("response OK")
    const json = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify(json),
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: error.code }),
    }
  }
}

module.exports = { handler }

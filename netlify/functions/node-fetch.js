const fetch = require('node-fetch')

const handler = async function () {
  try {
    const response = await fetch('https://api.crypto.com/v2/public/get-ticker', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const json = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify(json.data),
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

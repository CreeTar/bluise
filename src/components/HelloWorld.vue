<template>
  <div>
    <table>
      <tr>
        <td valign="center"><img src="https://crypto.com/exchange/img/logo.76653258.svg" width="169" height="34" alt="cryto.com"/></td>
        <td valign="center" style="font-weight: normal; color: #e4e4e4; padding-bottom: 8px; font-size: 14pt; font-family: Verdana;">- CSV-Parser</td>
      </tr>
      <tr>
        <td colspan="2"><hr size="1">
        </td>
      </tr>
      <tr style="font-size: 10pt">
        <td>
<!--          <button @click="$refs['uploadCtr'].click()">Select crypto_transactions_records...csv</button>-->
          <input type="file" id="uploadCtr" multiple style="display: block;" ref="uploadCtr">
        </td>
        <td><button @click="checkUpload">upload</button></td>
      </tr>
    </table>
    <h1>{{ getPrice }}</h1>
    <table>
      <tr>
        <th colspan="2">Supercharger Rewards</th>
      </tr>
      <tr style="font-family: Consolas; font-size: 11pt;">
        <th>Coin</th>
        <th>Amount</th>
      </tr>
      <tr v-for="asset in Object.keys(superChargerRewards)" style="font-family: Consolas; font-size: 10pt;" v-bind:key="asset">
        <td>{{ asset }}</td>
        <td>{{ superChargerRewards[asset] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      superChargerRewards: {},
      tickerData: {}
    }
  },
  created() {
    var connection = new WebSocket('wss://stream.crypto.com/v2/market', ['soap', 'xmpp']);
    fetch('https://api.crypto.com/v2/public/get-ticker').then((response) => {
      this.tickerData = response.json();
    });
  },
  methods: {
    getRate(asset) {
      // find USDT rate frist
      const usdtRate = this.tickerData.result.data.find((ticker) => ticker['i'] === asset + "_USDT");
      if (usdtRate) {
        return Number(usdtRate['b']);
      }

      console.warn('no USDT rate, checking for BTC');
      // find BTC rate
      const btcRate = this.tickerData.result.data.find((ticker) => ticker['i'] === asset + "_BTC");
      if (btcRate) {
        const btcRate = Number(btcRate['b']);
        const btcUsdtRate = this.tickerData.result.data.find((ticker) => ticker['i'] === "BTC_USDT");
        return btcRate * Number(btcUsdtRate)
      }

      console.error('No rate for BTC or USDT was found')
      return 0
    },
    checkUpload() {
      const files = this.$refs['uploadCtr'].files;
      for (let file of files) {
        console.log(file);
        if (file) {
          if (file.name.startsWith('crypto_transactions_record')) {
            this.parseCryptoTransactionsRecords(file);
          } else {
            console.warn('unkown file type');
          }
        } else {
          console.debug("no file selected");
        }
      }
    },
    async getFileContent(file) {
      return await file.text();
    },
    async parseCryptoTransactionsRecords(file) {
      const content = (await this.getFileContent(file)).toString();
      const lines = content.split('\n')
      // const header = lines.shift();
      lines.shift();
      const entries = lines.map((line) => line.split(','))

      const idxDesc = 1;
      const idxAsset = 2;
      const idxAmount = 3;
      for (const entry of entries) {
        if (entry[idxDesc] === 'Supercharger Reward') {
          console.log(entry.join('|'))
          const asset = entry[idxAsset];
          const currentAmount = this.superChargerRewards[asset];
          let newAmount = Number(entry[idxAmount]);
          if (currentAmount) {
            newAmount += Number(currentAmount)
          }

          this.$set(this.superChargerRewards, asset, newAmount)
        }
      }

      // console.log(entries);
    }
  },
  computed: {
    getPrice: () => {
      return 31234.56;
      //(await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=EUR')).json().toString();
    }
  }
}
</script>

<style scoped>
th { text-align: left; }
a {
  color: #42b983;
}
</style>

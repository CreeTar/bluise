<template>
  <v-container class="mx-auto" style="width: 700px">
    <v-card width="700" class="mx-auto align-center justify-center" dark>
      <v-card-title>
        <img src="https://crypto.com/exchange/img/logo.76653258.svg" width="169" height="34" alt="cryto.com"/>
        <v-spacer/><span style="font-weight: bold; color: #e4e4e4; padding-bottom: 8px; font-size: 14pt; font-family: Roboto;">CSV-Parser</span>
      </v-card-title>
      <v-card-text style="margin: 5px">
        <v-row style="margin: 2px 2px 10px 2px">
          <v-file-input v-model="ctrFiles" dense outlined dark multiple placeholder="crypto_transactions_records.csv" show-size hide-details clearable id="uploadCtr"></v-file-input>
          <v-btn @click="checkUpload" :disabled="this.ctrFiles.length === 0" text>upload</v-btn>
        </v-row>
        <v-tabs dark v-model="tabs" >
          <v-tab>Cashback</v-tab>
          <v-tab>Supercharger</v-tab>
          <v-tab>Earn</v-tab>
          <v-tab>Stake</v-tab>
          <v-tab>Balance</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tabs" dark style="margin-top: 10px;">
          <v-tab-item>
            <v-simple-table dark fixed-header>
            <thead>
            <tr style="font-family: Consolas; font-size: 11pt;">
              <th>Amount</th>
              <th style="border-left: 1px solid #444444;">USDT-MarketValue</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="asset in Object.keys(cardCashback)" style="font-family: Consolas; font-size: 10pt;" v-bind:key="asset">
              <td>{{ asset.padEnd(5, "&#160;") }} {{ cardCashback[asset].amount.toFixed(8).padStart(15, "&#160;") }}</td>
              <td style="border-left: 1px solid #444444;">USDT {{ cardCashback[asset].inUSDT.toFixed(4).padStart(15, "&#160;") }}</td>
            </tr>
            </tbody>
          </v-simple-table>
          </v-tab-item>
          <v-tab-item>
            <v-simple-table dark fixed-header>
            <thead>
            <tr style="font-family: Consolas; font-size: 11pt;">
              <th>Amount</th>
              <th style="border-left: 1px solid #444444;">USDT-MarketValue</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="asset in Object.keys(superChargerRewards)" style="font-family: Consolas; font-size: 10pt;" v-bind:key="asset">
              <td>{{ asset.padEnd(5, "&#160;") }} {{ superChargerRewards[asset].amount.toFixed(8).padStart(15, "&#160;") }}</td>
              <td style="border-left: 1px solid #444444;">USDT {{ superChargerRewards[asset].inUSDT.toFixed(4).padStart(15, "&#160;") }}</td>
            </tr>
            </tbody>
          </v-simple-table>
          </v-tab-item>
          <v-tab-item>test3</v-tab-item>
          <v-tab-item>test4</v-tab-item>
        </v-tabs-items>


      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      superChargerRewards: {},
      cardCashback: {},
      earnRewards: {},
      tickerData: {},
      tabs: {},
      ctrFiles: []
    }
  },
  created() {
    const isLocalExecution = location.href.startsWith('http://localhost')
    if (isLocalExecution) {
      console.log("Local execution, using fake ticker prices")
      this.tickerData = {
        "code": 0,
        "method": "public/get-ticker",
        "result": {
          "data": [
            {
              "i": "SDN_USDT",
              "b": 1.3677,
              "t": 1642265298043,
            },
            {
              "i": "HBAR_USDT",
              "b": 0.28208,
              "t": 1642265298255,
            },
            {
              "i": "AXS_USDT",
              "b": 75.3299,
              "t": 1642265298243,
            },
            {
              "i": "DYDX_BTC",
              "b": 0.00018219,
              "t": 1642265298239,
            },
            {
              "i": "SOL_USDT",
              "b": 146.366,
              "t": 1642301960305,
            },
            {
              "i": "ADA_USDT",
              "b": 1.32248,
              "t": 1642301960438,
            },
            {
              "i": "CRO_USDT",
              "b": 0.46229,
              "t": 1642301960383,
            },
            {
              "i": "BTC_USDT",
              "b": 43293.17,
              "t": 1642265298206,
            },
          ]
        }
      }
    } else {
      fetch('https://naughty-brattain-16b94f.netlify.app/.netlify/functions/node-fetch').then((response) => {
        this.tickerData = response.json();
      });
    }
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
        const btcUsdtRate = this.tickerData.result.data.find((ticker) => ticker['i'] === "BTC_USDT");
        return Number(btcRate['b']) * Number(btcUsdtRate['b'])
      }

      console.error('No rate for BTC or USDT was found')
      return 0
    },
    checkUpload() {
      const files = this.ctrFiles;
      for (let file of files) {
        console.log(file);
        if (file) {
          if (file.name.startsWith('crypto_transactions_record')) {
            this.parseCryptoTransactionsRecords(file).then(() => {
              for (const coin of Object.keys(this.superChargerRewards)) {
                const rate = this.getRate(coin)
                if (rate) {
                  const inUSDT = Number(rate) * (this.superChargerRewards[coin].amount)
                  console.log(inUSDT)
                  this.superChargerRewards[coin].inUSDT = inUSDT
                }
              }
            })
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
      lines.shift(); // const header = lines.shift();
      const entries = lines.map((line) => line.split(','))

      const idxDesc = 1;
      const idxCoin = 2;
      const idxAmount = 3;
      for (const entry of entries) {
        console.log(entry.join('|'))
        if (entry[idxDesc] === 'Card Cashback') {
          const coinName = entry[idxCoin];
          const currentAmount = this.cardCashback[coinName]?.amount;
          let newAmount = Number(entry[idxAmount]);
          if (currentAmount) {
            newAmount += Number(currentAmount)
          }

          this.$set(this.cardCashback, coinName, { amount: newAmount, inUSDT: 0 })
        }
        else if (entry[idxDesc] === 'Supercharger Reward') {
          const coinName = entry[idxCoin];
          const currentAmount = this.superChargerRewards[coinName]?.amount;
          let newAmount = Number(entry[idxAmount]);
          if (currentAmount) {
            newAmount += Number(currentAmount)
          }

          this.$set(this.superChargerRewards, coinName, { amount: newAmount, inUSDT: 0 })
        }
      }

      // console.log(entries);
    }
  },
  computed: {
  }
}
</script>

<style scoped>
th { text-align: left; }
a {
  color: #42b983;
}
</style>

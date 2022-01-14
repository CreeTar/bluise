import { createHmac } from 'crypto';
import axios from 'axios';

export default class ApiService {
	secret: string;
	server: string;
	apiKey: string;

	constructor(apiKey: string, secret: string, server: string) {
		this.apiKey = apiKey;
		this.secret = secret;
		this.server = server;
	}

	testConnection() {
		console.log('calling ' + this.server);
		const endPointAccountStatus = '/sapi/v1/account/status';
		const url = this.server + endPointAccountStatus;

		const params = [];
		params.push(`timestamp=${new Date().getTime()}`);

		const query = params.join('&');

		const hmac = this.getHmac(this.secret, query);
		console.log('hmac ' + hmac);

		params.push(`signature=${hmac}`);

		//const { data } = await axios.get<MyInterface>(url, {

		const call = url + '?' + params.join('&');
		axios
			.get(call, {
				headers: {
					'X-MBX-APIKEY': this.apiKey,
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
			.then((response) => {
				console.log('data ' + response);
				return response.data;
			})
			.catch((err) => {
				console.error(err);
				return err;
			});
	}

	getHmac(secret: string, data: string): string {
		const hmac = createHmac('sha256', secret).update(data).digest('base64');

		return hmac;
	}

	/*
	void testApi() {
		// 30 days limit or 100 entries

		def params = []

		def query = params.join('&')
		println "hmac($secret, $query)"
		println "-" * 120
		def hmac = hmac(secret, query)
		params << "signature=${hmac}"

		println params.join('\n')
		def call = url + "?" + params.join('&')
		println "-" * 120
		println "calling $call"

		def client = new HttpClient()
		def get = new GetMethod(call)
		get.setRequestHeader("X-MBX-APIKEY", key)
		get.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

		println client.executeMethod(get)

		println "-" * 120
		println get.responseBodyAsString
		println "-" * 120
	}

	def String hmac(String secretKey, String data, String type = "HmacSHA256") {
		def mac = Mac.getInstance(type)
		mac.init(new SecretKeySpec(secretKey.getBytes(), type))
		def digest = mac.doFinal(data.getBytes())
		def hex = digest.encodeHex().toString()
		return hex
	}  
  */
}

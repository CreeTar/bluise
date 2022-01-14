<template>
	<v-container class="py-5 px-8 ma-0 justify-center">
		<v-alert
			dense
			v-if="alertText.length > 0"
			dismissible
			outlined
			:type="alertType"
			>{{ alertText }}</v-alert
		>
		<v-card flat>
			<v-card-text class="px-0">
				<v-row no-gutters>
					<v-col cols="10">
						<v-text-field
							justify="left"
							dense
							v-model="apiKey"
							label="API-Key"
							outlined
						/>
					</v-col>
					<v-col cols="2">
						<v-btn text>Paste</v-btn>
					</v-col>
				</v-row>
				<v-row no-gutters>
					<v-col cols="10">
						<v-text-field
							dense
							v-model="apiSecret"
							label="API-Secret"
							outlined
						/>
					</v-col>
					<v-col cols="2">
						<v-btn text>Paste</v-btn>
					</v-col>
				</v-row>
				<v-row no-gutters>
					<v-col cols="10">
						<v-text-field
							dense
							v-model="apiServer"
							label="API-Server"
							readonly
							outlined
						></v-text-field>
					</v-col>
				</v-row>
				<v-row>
					<v-col xl="5" lg="5" md="5" sm="5" xs="5">
						<v-btn large :disabled="!canTest" @click="testApi"
							>Test Connection</v-btn
						>
					</v-col>
					<v-col xl="5" lg="5" md="5" sm="5" xs="5">
						<v-btn large :disabled="!apiTested">Save Settings</v-btn>
					</v-col>
					<v-col cols="2">-</v-col>
				</v-row>
				<!--v-row>
					<a
						href="https://www.binance.com/en/support/faq/360002502072"
						target="_blank"
						>How to get your API key</a
					>
				</v-row-->
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
import ApiService from '@/components/ApiService.ts';

export default {
	name: 'ApiSettings',
	components: {},
	computed: {
		canTest() {
			return (
				this.apiKey.length > 0 &&
				this.apiSecret.length > 0 &&
				this.apiServer.length > 0
			);
		}
	},
	data() {
		return {
			apiKey: '',
			apiSecret: '',
			apiServer: 'https://api.binance.com',
			apiTested: false,
			alertType: '',
			alertText: ''
		};
	},
	methods: {
		testApi() {
			const service = new ApiService(
				this.apiKey,
				this.apiSecret,
				this.apiServer
			);
			try {
				const result = service.testConnection();
				if (result === 'Normal') {
					this.showAlert('success', 'API tested successfully');
					this.apiTested = true;
				} else {
					this.showAlert('error', result);
					this.apiTested = false;
				}
			} catch (err) {
				console.log('err');
				this.showAlert('error', err);
				this.apiTested = false;
			}
		},
		showAlert(type, text) {
			this.alertType = type;
			this.alertText = '' + text;
		}
	}
};
</script>

<style>
</style>

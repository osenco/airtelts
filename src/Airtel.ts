import axios, { AxiosInstance } from "axios";

export default class Airtel {
	protected api: AxiosInstance;

	constructor(
		protected client_id: string,
		protected client_secret: string,
		protected env = "live",
		protected token = ""
	) {
		this.api = axios.create({
			baseURL:
				env === "sandbox"
					? "https://openapiuat.airtel.africa/"
					: "https://openapi.airtel.africa/",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});
	}

	public async authorize(): Promise<Airtel> {
		try {
			const { data }: { data: AirtelTokenResoonse } = await this.api.post(
				"auth/oauth2/token",
				{
					client_id: this.client_id,
					client_secret: this.client_secret,
					grant_type: "client_credentials",
				}
			);

			if (data.access_token) {
				this.token = data.access_token;
			}
		} catch (error) {}

		return this;
	}

	public async prompt(
		phone: string,
		amount: number,
		reference: string | number = Math.random()
			.toString(16)
			.slice(2, 8)
			.toUpperCase(),
		country = "KE",
		currency = "KES"
	) {
		try {
			const { data }: { data: AirtelPromptResponse } =
				await this.api.post(
					"merchant/v1/payments/",
					{
						reference,
						subscriber: {
							country,
							currency,
							msisdn: phone.slice(-9),
						},
						transaction: {
							amount,
							country,
							currency,
							id: reference,
						},
					},
					{
						headers: {
							"X-Country": country,
							"X-Currency": currency,
							Authorization: `Bearer ${this.token}`,
						},
					}
				);

			if (data.status.success) {
				return data;
			} else {
				throw new Error(data.status.message);
			}
		} catch (error) {}
	}

	public async reconcile(
		response: AirtelIpnPayload,
		callback: CallableFunction | null = null
	) {
		if (!response["transaction"]) {
			throw new Error("No transaction data received");
		}

		const transaction = response["transaction"]["id"] ?? "";
		const message = response["transaction"]["message"] ?? "";

		if (!transaction) {
			throw new Error(message);
		}

		if (callback) {
			callback(response);
		}

		return response;
	}
}
